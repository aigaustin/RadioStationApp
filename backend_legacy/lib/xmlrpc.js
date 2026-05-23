const https = require('https');
const http = require('http');

/**
 * Lightweight XML-RPC client for MediaCP / Streamo.
 *
 * Usage:
 *   const result = await xmlrpcCall('https://cp.streamo.ng:2020/system/rpc.php', 'service.status', {
 *     auth: 'API_KEY',
 *     serverid: 10,
 *   });
 */

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function valueToXml(value) {
  if (typeof value === 'boolean') {
    return `<value><boolean>${value ? '1' : '0'}</boolean></value>`;
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return `<value><int>${value}</int></value>`;
    }
    return `<value><double>${value}</double></value>`;
  }
  if (typeof value === 'string') {
    return `<value><string>${escapeXml(value)}</string></value>`;
  }
  if (Array.isArray(value)) {
    const items = value.map((v) => valueToXml(v)).join('');
    return `<value><array><data>${items}</data></array></value>`;
  }
  if (value && typeof value === 'object') {
    const members = Object.entries(value)
      .map(([k, v]) => `<member><name>${escapeXml(k)}</name>${valueToXml(v)}</member>`)
      .join('');
    return `<value><struct>${members}</struct></value>`;
  }
  return `<value><string></string></value>`;
}

function buildRequest(method, params) {
  const paramXml = params.map((p) => `<param>${valueToXml(p)}</param>`).join('');
  return `<?xml version="1.0"?><methodCall><methodName>${escapeXml(method)}</methodName><params>${paramXml}</params></methodCall>`;
}

/**
 * Very basic XML-RPC response parser.
 * Handles: string, int/i4, boolean, double, struct, array.
 */
function parseValue(xml) {
  // String
  let m = xml.match(/<string>([\s\S]*?)<\/string>/);
  if (m) return m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");

  // Int
  m = xml.match(/<(?:int|i4)>([-\d]+)<\/(?:int|i4)>/);
  if (m) return parseInt(m[1], 10);

  // Boolean
  m = xml.match(/<boolean>([01])<\/boolean>/);
  if (m) return m[1] === '1';

  // Double
  m = xml.match(/<double>([-\d.eE+]+)<\/double>/);
  if (m) return parseFloat(m[1]);

  // Struct
  if (xml.includes('<struct>')) {
    const obj = {};
    const memberRegex = /<member>\s*<name>([\s\S]*?)<\/name>\s*(<value>[\s\S]*?<\/value>)\s*<\/member>/g;
    let mm;
    while ((mm = memberRegex.exec(xml)) !== null) {
      const name = mm[1].trim();
      obj[name] = parseValue(mm[2]);
    }
    return obj;
  }

  // Array
  if (xml.includes('<array>')) {
    const arr = [];
    const dataMatch = xml.match(/<data>([\s\S]*?)<\/data>/);
    if (dataMatch) {
      const valueRegex = /<value>([\s\S]*?)<\/value>/g;
      let vm;
      while ((vm = valueRegex.exec(dataMatch[1])) !== null) {
        arr.push(parseValue(`<value>${vm[1]}</value>`));
      }
    }
    return arr;
  }

  // Bare text inside <value>text</value>
  m = xml.match(/<value>([\s\S]*?)<\/value>/);
  if (m) return m[1].trim();

  return null;
}

function parseResponse(responseXml) {
  // Check for fault
  if (responseXml.includes('<fault>')) {
    const faultValue = responseXml.match(/<fault>\s*(<value>[\s\S]*?<\/value>)\s*<\/fault>/);
    const fault = faultValue ? parseValue(faultValue[1]) : { faultString: 'Unknown fault' };
    return { ok: false, fault };
  }
  // Parse params
  const paramMatch = responseXml.match(/<params>\s*<param>\s*(<value>[\s\S]*?<\/value>)\s*<\/param>\s*<\/params>/);
  if (!paramMatch) return { ok: false, fault: { faultString: 'No params in response' } };
  return { ok: true, data: parseValue(paramMatch[1]) };
}

/**
 * Call an XML-RPC method.
 * @param {string} url — Full URL to the RPC endpoint
 * @param {string} method — e.g. 'service.status'
 * @param {object} args — Struct argument
 * @param {number} [timeoutMs=15000]
 * @returns {Promise<{ok: boolean, data?: any, fault?: any}>}
 */
function xmlrpcCall(url, method, args = {}, timeoutMs = 15000) {
  return new Promise((resolve) => {
    const body = buildRequest(method, [args]);
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + (parsed.search || ''),
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(body),
      },
      rejectUnauthorized: false, // Many streaming panels use self-signed certs
      timeout: timeoutMs,
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(parseResponse(data));
        } catch (e) {
          resolve({ ok: false, fault: { faultString: 'Parse error: ' + e.message } });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ ok: false, fault: { faultString: 'Network error: ' + e.message } });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, fault: { faultString: 'Request timed out' } });
    });

    req.write(body);
    req.end();
  });
}

module.exports = { xmlrpcCall, buildRequest, parseResponse };
