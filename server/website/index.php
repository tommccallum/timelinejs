<?php

// Simple REST API server
// We will accept JSON requests in and will send back json.
// We don't use PHP sessions, everything should be kept in the db or on the client side.
// The user can create a new timeline but if they want to save it then they need to create
// a new account.

require_once __DIR__ . '/vendor/autoload.php';


class Session {
    private $session = null;
    private $document = null;

    public function __construct($collection, $session=null) {
        $this->collection = $collection;
        if ( $session === null ) {
            $this->__createSession($this->collection);
        } else {
            $this->session = $session;
            $this->load();
        }
    }

    public function getDocument() {
        return $this->document;
    }

    public function getSession() {
        return $this->session;
    }

    public function getToken() {
        if ( $this->document === null ) {
            return null;
        }
        if ( !array_key_exists("token", $this->document) ) {
            return null;
        }
        return $this->document['token'];
    }

    public function createNewToken() {
        return $this->__generateNewTokenForUser($this->session)
    }

    private function __generateNewTokenForUser($session) {
        # TODO(tom) We need to generate a unique token per call as a nonce.
        # We will check this only for WRITE calls.
        $newToken = $this->__generateRandomAlphanumericString()(64);
        $this->collection->updateOne(["session" => $session], [ '$set' => [ "token" => $newToken ]]);
        $this->document['token'] = $newToken;
    }

    private function __createSession($collection) {
        // Here the user may not have logged in and we want to identify them so 
        // we create a new user for them.
        $sessionIsUnique = false;
        while( !$sessionIsUnique ) {
            // A session is kept for a set period e.g. 24 hours
            $session = $this->__generateRandomAlphanumericString();
            $result = $collection->count(['session' => ['$eq' => $session]]);
            $sessionIsUnique = $result === 0;
        }

        $this->session = $session;
        // We insert the current session into the database.
        // When the user eventually logins or signs up we can associate this session
        // with the resulting account.
        $collection->insertOne(["session" => $session]);
    }

    private function __generateRandomAlphanumericString() {
        $sessionLength = 64;
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $sessionLength; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    public function load() {
        $document = $this->collection->findOne(["session" => [ '$eq' => $this->session]]);
        if ( $this->document === null ) {
            send(["session" => $this->session], [ "error" => "INVALID_SESSION" ]);
        }
        $this->document = $document;
        return $document;
    }

    public function save($sessionDocument) {
        $sessionDocument['session'] = $this->session;
        $collection->replaceOne(["session" => ['$eq' => $this->session ]], $sessionDocument);
    }
}

// @param $action   Normalised action from getUserCommand
function createAction($action) {
    switch ( $action ) {
    case "GET_SESSION":
        return new GetSessionAction();
    }
    return null;
}

abstract class Action {
    private $actionName = "";
    
    public function __construct($actionName) {
        $this->actionName = $actionName;
    }

    abstract public function isWrite();

    public function toString() {
        return $this->actionName;
    }

    protected function createResponse($session) {
        $resp = [
            "token" => $session->getToken(),
            "session" => $session->getSession()
        ];
        return $resp;
    }

    abstract public function execute($collection, $fromUser, $session);
}

abstract class ReadAction extends Action {
    public function __construct() {
        parent::__construct("NEW READ ACTION");
    }

    public function isWrite() {
        return false;
    }
}

class GetSessionAction extends ReadAction {
    public function __construct() {
        parent::__construct("GET_SESSION");
    }

    public function execute($collection, $fromUser, $session) {
        $toUser = $this->createResponse($session);
        $toUser['document'] = $session->getDocument();
        send($toUser);
    }
}

abstract class WriteAction extends Action {
    public function __construct() {
        parent::__construct("NEW WRITE ACTION");
    }

    public function isWrite() {
        return true;
    }

    protected function createResponse($session) {
        $newToken = $session->createNewToken();
        $resp = [
            "token" => $newToken,
            "session" => $session
        ];
        return $resp;
    }
}




function send($data=null, $error=null)
{
    if ( !array_key_exists("session", $data) ) {
        throw new Exception("No session found in data to be sent - this should never happen!");
    }
    $token = generateNewTokenForUser($data['session']);
    $toUser = [
        "token" => $token,
        "data" => $data,
        "error" => $error
    ];
    $output = json_encode($toUser);

    // Send back to user after this we MUST finish
    // header("Cache-Control: no-cache, must-revalidate");
    // header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
    header("Content-type: application/json");
    echo $output."\n";
    exit(0);
}

function sendEmpty() {
    // Send back to user after this we MUST finish
    header("Cache-Control: no-cache, must-revalidate");
    header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
    header("Content-type: application/json");
    echo json_encode(["error" => "Invalid API call."]);
    exit(0);
}

function recv()
{
    if ( array_key_exists("REQUEST_METHOD", $_SERVER) ) {
        $requestMethod = $_SERVER['REQUEST_METHOD'];
    } else {
        $requestMethod = "CMD";
    }
    $json = file_get_contents("php://input");
    $fromUser = [
        "method" => $requestMethod,
        "body" => json_decode($json, $assoc = true)
    ];
    return $fromUser;
}

function validateRequestOrDecline($fromUser) {
    if ( $fromUser["body"] === null ) {
        // This was not an API call so don't give them anything.
        sendEmpty();
    }
}

function login()
{
}

function logout()
{
}

function isFirstVisit($userData) {
    if ( !array_key_exists("body", $userData) ) {
        return true;
    }
    if ( array_key_exists("session", $userData['body']) ) {
        return false;
    }
    if ( array_key_exists("action", $userData['body']) ) {
        if ( $userData['body']['action'] === "new_session" ) {
            return true;
        }
    }
    return false;
}

function getSessionFromInput($userData) {
    if ( !array_key_exists("body", $userData) ) {
        return true;
    }
    if ( !array_key_exists("session", $userData['body']) ) {
        return false;
    }
    return $userData['body']['session'];
}

function isUserLoggedIn($userData)
{
    if ( !array_key_exists("body", $userData) ) {
        return false;
    }
    if ( array_key_exists("token", $userData['body']) ) {
        return true;
    }
    return false;
}

function getUserCommand($userData) {
    if ( !array_key_exists("body", $userData) ) {
        return false;
    }
    if ( !array_key_exists("session", $userData['body']) ) {
        return false;
    }
    if ( array_key_exists("action", $userData['body']) ) {
        return strtoupper($userData['body']['action']);
    }
    return false;
}


$mdb = new MongoDB\Client("mongodb://localhost:27017");

// This will create a new database if it does not already exist.
$db = $mdb->timeline;

$fromUser = recv();
$toUser = [];
$session = null;

// This will not return if we receive junk.
validateRequestOrDecline($fromUser);

$collection =$db->user_data;

if ( isFirstVisit($fromUser) ) {
    $session = new Session($collection);
} else {
    $userSession = getSessionFromInput($fromUser);
    $session = new Session($collection, $userSession);
}

if ( isUserLoggedIn($fromUser) ) {
    // the following functionality is only available if the user is logged in
    $command = getUserCommand($fromUser);
    switch($command) {
    default:
        // ignore this action
        break;
    }
}

// the following functionality is available without being logged in
// we have at least a token
$command = getUserCommand($fromUser);
switch($command) {
case "CREATE_TIMELINE":
    // We don't use a dictionary here as the person may have multiple timelines called the same thing.
    // That would be confusing but who knows.
    $sessionDocument['session'] = $fromUser['body']['session'];
    $timeline = $fromUser['body']['timeline'];
    if ( !array_key_exists('timelines', $sessionDocument) ) {
        $sessionDocument['timelines'] = [];
    }
    array_push($sessionDocument['timelines'], $timeline);
    $collection->replaceOne(["session" => ['$eq' => $fromUser['body']['session']]], $sessionDocument);
    $toUser["confirmed_action"] = $command;
    break;
case "DELETE_TIMELINE":
    $sessionDocument['session'] = $fromUser['body']['session'];
    $timelineName = $fromUser['body']['timeline']['name'];
    $timelineIndex = $fromUser['body']['timeline']['index'];
    if ( array_key_exists('timelines', $sessionDocument) ) {
        $found = false;
        foreach( $sessionDocument['timelines'] as $k => $v ) {
            if ( $v['name'] == $timelineName && $k == $timelineIndex ) {
                $sessionDocument['timelines'][$k] = null;
                $found = true;
                break;
            }
        }
        if ( !$found ) {
            $error = [  "error" => "INVALID_TIMELINE", 
                        "details" => $fromUser['body']['timeline']
            ];
            send($toUser, $error);
        }
    }
    $collection->replaceOne(["session" => ['$eq' => $fromUser['body']['session']]], $sessionDocument);
    $toUser["timelines"] = $sessionDocument['timelines'];
    $toUser["confirmed_action"] = $command;
    break;
case "GET_SESSION":
    // Return the entire user document
    $actionImpl = createAction($command);
    $actionImpl->execute($collection, $fromUser, $session);
    break;
default:
    $toUser["confirmed_action"] = "UNKNOWN_ACTION";
    break;
}

send($toUser);