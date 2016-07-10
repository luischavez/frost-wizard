<?php

namespace Frost\Wizard;

class Wizard {

    const CONFIGURE_PARAM = 'configure';
    const ACTION_PARAM = 'wizardAction';
    const STEP_INDEX_PARAM = 'stepIndex';

    protected $steps = array();

    public function loadConfiguration() {
        $configuration = array(
            'steps' => array(),
            'stepIndex' => 0
        );

        foreach ($this->steps as $step) {
            array_push($configuration['steps'], array(
                'content' => $step->content()
            ));
        }

        return json_encode($configuration);
    }

    public function step($step) {
        $index = count($this->steps);

        if (is_string($step)) {
            $step = new $step();
            $step->setStepIndex($index);
        }

        array_push($this->steps, $step);

        foreach ($this->steps as $step) {
            $step->setMaxStep($index);
        }
    }

    public function trigger($send = false) {
        $statusCode = 500;
        $data = array();

        if (isset($_GET[self::CONFIGURE_PARAM])) {
            $statusCode = 200;
            $data = $this->loadConfiguration();
        } else if (isset($_GET[self::ACTION_PARAM]) 
            && isset($_GET[self::STEP_INDEX_PARAM])) {
            $action = $_GET[self::ACTION_PARAM];
            $stepIndex = $_GET[self::STEP_INDEX_PARAM];

            if (!in_array($stepIndex, array_keys($this->steps))) {
                $data = new Response(
                    0, Response::ERROR_RESPONSE, 'Invalid request.');
            } else {
                $step = $this->steps[$stepIndex];

                if ($step->can($action)) {
                    $response = $step->$action();

                    $statusCode = $response->statusCode();
                    $data = (string) $response;
                } else {
                    $data = new Response(
                        0, Response::ERROR_RESPONSE, 'Invalid request.');
                }
            }
        } else {
            $data = new Response(
                0, Response::ERROR_RESPONSE, 'Invalid request.');
        }

        if ($send) {
            return Response::send($data, $statusCode);
        }

        return $data;
    }

}
