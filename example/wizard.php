<?php

require __DIR__ . '/../vendor/autoload.php';

use Frost\Wizard\Wizard as Wizard;
use Frost\Wizard\Step as Step;

$wizard = new Wizard();

class WelcomeStep extends Step {

    protected $actions = array('delete', 'save');

    public function content() {
        return array(
            array(
                'append' => 'Welcome!',
                'target' => '#title'
            ),
            array(
                'append' => 'welcome.html',
                'target' => '#main',
                'view' => true
            )
        );
    }

    public function delete() {
        return $this->success("Deleted item [{$_GET['id']}]");
    }

    public function save() {
        return $this->success("Saved {$_POST['name']}");
    }

}

$wizard->step('WelcomeStep');

$wizard->trigger(true);
