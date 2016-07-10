<?php

namespace Frost\Wizard;

class Step {

    protected $actions = array();

    protected $stepIndex;
    protected $maxStep;

    public function getStepIndex() {
        return $this->stepIndex;
    }

    public function setStepIndex($stepIndex) {
        $this->stepIndex = $stepIndex;
    }

    public function getMaxStep() {
        return $this->maxStep;
    }

    public function setMaxStep($maxStep) {
        $this->maxStep = $maxStep;
    }

    public function can($action) {
        return in_array($action, $this->actions);
    }

    public function content() {
        return array();
    }

    public function prev() {
        if (!$this->toPrev()) {
            return $this->fails('Can\'t go back.');
        }

        if (0 == $this->stepIndex) {
            return $this->error('Invalid step index.');
        }

        return new Response($this->stepIndex - 1);
    }

    public function next() {
        if (!$this->toNext()) {
            return $this->fails('Can\'t go next.');
        }

        if ($this->maxStep == $this->stepIndex) {
            return $this->error('Invalid step index.');
        }

        return new Response($this->stepIndex + 1);
    }

    protected function toPrev() {
        return true;
    }

    protected function toNext() {
        return true;
    }

    protected function success($message) {
        return new Response(
            $this->stepIndex, Response::SUCCESS_RESPONSE, $message);
    }

    protected function fails($message) {
        return new Response(
            $this->stepIndex, Response::FAILS_RESPONSE, $message);
    }

    protected function error($message) {
        return new Response(
            $this->stepIndex, Response::ERROR_RESPONSE, $message);
    }

}
