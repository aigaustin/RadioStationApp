Api Documentation
 Andrew
logout
Search
 
It is possible to connect to and perform various functions remotely with the control panel using PHP.

You will be required to download and include the XML-RPC Library for PHP:
https://code.google.com/archive/p/php-ixr/

Table of Contents

Service Functions
service.overview
service.status
service.start
service.stop
service.restart
service.updatetitle
service.kicksource
service.wowza_alias
service.wowza_tvschedule
service.wowza_tvschedule_playlist

Source Functions
source.status
source.restart
source.start
source.stop

Service Functions
service.overview
Outputs an array of the entire service configuration.

Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
ServerID *	INT	The Service ID to be stopped and removed from the control panel.
unique_id	INT	ALTERNATIVE to serverid, specify the unique_id of the service to be removed.
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "service.overview"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "ServerID" => 10
 ); 
 
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 
service.status
Returns the status of the service with one of the following responses.

failed - Unable to lookup service
offline - Service is Offline.
online - Service is Online
suspended - Service is Suspended
expired - Service is Expired
unconnectable - Service is unreachable
Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
serverid	INT	The Service ID to be stopped and removed from the control panel.
unique_id	INT	ALTERNATIVE to serverid, specify the unique_id of the service to be removed.
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "service.status"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "serverid" => 10
 ); 
 
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 
service.start
Starts a specific media service.

Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
ServerID	INT	The Service ID to be stopped and removed from the control panel.
unique_id	INT	ALTERNATIVE to serverid, specify the unique_id of the service to be removed.
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "service.start"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "ServerID" => 10
 ); 
 
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 
service.stop
Stops a specific media service.

Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
ServerID	INT	The Service ID to be stopped and removed from the control panel.
unique_id	INT	ALTERNATIVE to serverid, specify the unique_id of the service to be removed.
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "service.stop"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "ServerID" => 10
 ); 
 
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 
service.restart
Restarts a specific media service.

Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
ServerID	INT	The Service ID to be stopped and removed from the control panel.
unique_id	INT	ALTERNATIVE to serverid, specify the unique_id of the service to be removed.
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "service.restart"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "ServerID" => 10
 ); 
 
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 
service.updatetitle
Updates the Now Playing title of a live stream.

Only compatible with Shoutcast 198, Shoutcast 2, Icecast 2 & Icecast KH.

Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
ServerID	INT	The Service ID to be stopped and removed from the control panel.
unique_id	INT	ALTERNATIVE to serverid, specify the unique_id of the service to be removed.
NewTitle	STRING (250 chars)	Text to replace the current Now Playing title of a live stream.
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "service.updatetitle"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "ServerID" => 10,
 "NewTitle" => "This control panel is the greatest"
 ); 
 
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 
service.kicksource
Kicks the active source on a live stream.

Only compatible with Shoutcast 198, Shoutcast 2, Icecast 2 & Icecast KH.

Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
ServerID	INT	The Service ID to be stopped and removed from the control panel.
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "service.kicksource"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "ServerID" => 10
 ); 
 
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 
service.wowza_alias
Manage the Stream Alias' of a Wowza Streaming Engine Service.

Only compatible with Wowza Streaming Engine services.

Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
ServerID	INT	The Service ID to be stopped and removed from the control panel.
action	create
remove	The action to perform with the specified alias
alias	STRING (50 char)	The alias stream name that can be viewed. rtmp://myserver/myapplication/myalias
name	STRING (50 char)	The actual origin stream that will be viewed. Default ${Stream.Name}
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "service.wowza_alias"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "ServerID" => 10,
 "alias" => "myalias",
 "name" => "${Stream.Name}"
 ); 
 
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 
service.wowza_tvschedule
Return a list of scheduled playlists from a Wowza TV Station service.

Only compatible with Wowza Streaming Engine services.

Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
ServerID *	INT	The Service ID to be stopped and removed from the control panel.
date_start	MySQL datetime field format	YYYY-MM-DD HH:MM:DD
date_end	MySQL datetime field format	YYYY-MM-DD HH:MM:DD
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "service.wowza_alias"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "ServerID" => 10,
 "date_start" => "2015-01-01 00:00:00",
 "date_end" => "2015-01-01 23:00:00"
 ); 
 
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 
service.wowza_tvschedule_playlist
Returns an array of scheduled files in a specific TV Station playlist.

Only compatible with Wowza Streaming Engine services.

Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
ServerID *	INT	The Service ID to be stopped and removed from the control panel.
playlist_id	INT	The playlist id that you wish to retrieve.
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "service.wowza_alias"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "ServerID" => 10,
 "playlist_id" => "1"
 ); 
 
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 
Source Functions
source.status
Returns the status of the source (AutoDJ).

Only compatible with Shoutcast 198, Shoutcast 2, Icecast 2 & Icecast KH.

Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
ServerID	INT	The Service ID to be stopped and removed from the control panel.
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "source.status"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "ServerID" => 10 
 ); 
 
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 
source.restart
Restarts the source plugin associated with a specific service using the last played playlist.

Only compatible with Shoutcast 198, Shoutcast 2, Icecast 2 & Icecast KH.

Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
ServerID	INT	The Service ID to be stopped and removed from the control panel.
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "source.restart"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "ServerID" => 10 
 ); 
 
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 
source.start
Starts the source plugin associated with a specific service using the last played playlist.

Only compatible with Shoutcast 198, Shoutcast 2, Icecast 2 & Icecast KH.

Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
ServerID	INT	The Service ID to be stopped and removed from the control panel.
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "source.start"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "ServerID" => 10 
 ); 
 
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 
source.stop
Stops the source plugin associated with a specific service.

Only compatible with Shoutcast 198, Shoutcast 2, Icecast 2 & Icecast KH.

Parameters
Parameter	Options	Description
auth *		API Key to authenticate to control panel.
ServerID	INT	The Service ID to be stopped and removed from the control panel.
PHP Sample
<?php
 require_once("../IXR_Library.php"); 
 
 $url = "https://cp.streamo.ng:2020/";
 $command = "source.stop"; 
 $arguments = array( 
 "auth" => "VJhZdqjUWpigishesXamoVSp33WZmoxWoZ-7XJysWs6coKyd0K2Glw==", 
 "ServerID" => 10 
 );  
 $client = new IXR_ClientSSL($url. '/system/rpc.php'); 
 $client->debug = true; /** Set to true if you have difficulties **/ 
 
 if ( !$client->query( $command, $arguments) ) { 
 die('An error occurred - '.$client->getErrorCode().":".$client->getErrorMessage()); 
 } 
 
 $return = $client->getResponse(); 
 
 if ( $return['status'] == 'success' ){ 
 echo $command. ' executed successfully.'; 
 }else{ 
 echo 'failed executing '. $command; 
 } 
 
 /** Output debugging information **/ 
 print_r( $return ); 
 
?>
 