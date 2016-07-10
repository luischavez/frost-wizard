<?php

namespace Frost\Wizard;

class Response {

    const SUCCESS_RESPONSE = 'success';
    const FAILS_RESPONSE = 'fails';
    const ERROR_RESPONSE = 'error';

    protected $type;
    protected $message;

    protected $stepIndex;

    protected $body = array();

    public function __construct($stepIndex, 
        $type = self::SUCCESS_RESPONSE, $message = null) {
        $this->type = $type;
        $this->message = $message;

        $this->stepIndex = $stepIndex;
    }

    public function with($key, $value) {
        $this->body[$key] = $value;
    }

    public function statusCode() {
        return self::ERROR_RESPONSE === $this->type ? 500 : 200;
    }

    public function __toString() {
        $data = array();

        if (self::ERROR_RESPONSE === $this->type) {
            $data = array('message' => $this->message);
        } else {
            $data = array(
                'status' => array(
                    'type' => $this->type,
                    'message' => $this->message
                ),
                'stepIndex' => $this->stepIndex,
                'body' => $this->body
            );
        }

        return json_encode($data);
    }

    public static function send($data, $statusCode = 200) {
        header('HTTP/1.1 ' . $statusCode);
        header('Content-Type: application/json; charset=UTF-8');

        die($data);
    }

}
