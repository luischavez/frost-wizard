/**
 * @file wizard plugin.
 *
 * @author frost_leviathan@hotmail.com (Luis Chavez)
 * @version 0.1
 */
(function ($) {

    "use strict";

    /**
     * Private object that handles all wizard functionality.
     */
    var wizard = {

        /**
         * Default wizard configuration.
         */
        defaults: {
            /* Url to perform ajax calls. */
            ajaxUrl: ''
        },

        /**
         * Current instance wizard configuration.
         */
        configuration: {},

        /**
         * Internal wizard data parameters.
         */
        data: {
            /* Information about the steps. */
            steps: [],

            /* Current step index. */
            stepIndex: 0
        },

        /**
         * Instances of the elements in the current step.
         */
        $el: {
            /* Container that wraps all the wizard content. */
            container: null,

            /* Content of the current wizard step. */
            content: [],

            /* Actions of the current wizard step. */
            actions: []
        },

        /**
         * Initializes the wizard.
         *
         * @param {object} options - contains wizard configuration.
         */
        init: function (options) {
            wizard.configuration = $.extend({}, wizard.defaults, options);
            wizard.$el.container = $(this);

            wizard.loadConfiguration(wizard.loadStep, wizard.error);
        },

        /**
         * Hide an action element.
         *
         * @param {string} action - action to hide.
         */
        hideAction: function (action) {
            $('[data-wizard-action=' + action + ']').hide();
        },

        /**
         * Show an action element.
         *
         * @param {string} action - action to show.
         */
        showAction: function (action) {
            $('[data-wizard-action=' + action + ']').show();
        },

        /**
         * Search a suffix in string.
         *
         * @param {string} string - string to check.
         * @param {string} suffix - suffix to search.
         * @return {boolean} true if string contains the suffix false otherwise.
         */
        endsWith: function (string, suffix) {
            return string.indexOf(suffix, string.length - suffix.length) !== -1;
        },

        /**
         * Obtains all data in the form and the extra data.
         *
         * @param {jQuery} $form - form element to extract data.
         * @param {object} appendData - extra data to append.
         */
        buildData: function ($form, appendData) {
            if (0 == $form.length) {
                var data = {};
                for (var i in appendData) {
                    data[i] = appendData[i];
                }
                return data;
            }

            var formData = new FormData();

            var data = $form.serializeArray().reduce(function(obj, item) {
                if (wizard.endsWith(item.name, '[]')) {
                    if (null == obj[item.name]) {
                        obj[item.name] = [];
                    }

                    obj[item.name].push(item.value);
                } else {
                    obj[item.name] = item.value;
                }

                return obj;
            }, {});

            for (var i in data) {
                formData.append(i, data[i]);
            }

            if (0 < $form.has('[type="file"]').length) {
                var $fileInputs = $('[type="file"]');

                $fileInputs.each(function (index) {
                    var $file = $($fileInputs[index]);
                    $.each($fileInputs[index].files, function(i, file) {
                        formData.append($file.attr('name'), file);
                    });
                });
            }

            for (var i in appendData) {
                formData.append(i, appendData[i]);
            }

            return formData;
        },

        /**
         * Perform a ajax call to a url.
         * 
         * @param {string} url - url to call.
         * @param {object} data - object of data to send.
         * @param {string} method - http method.
         * @param {callback} onDoneCallback - on done callback.
         * @param {callback} onFailCallback - on fail callback.
         */
        ajaxCall: function (url, data, method, onDoneCallback, onFailCallback) {
            $.ajax({
                url: url,
                type: method,
                dataType: 'json',
                data: data,
                cache: false,
                contentType: false,
                processData: 'POST' != method
            })
            .done(function (data, textStatus, jqXHR) {
                onDoneCallback(data, textStatus, jqXHR);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                onFailCallback(jqXHR, textStatus, errorThrown);
            });
        },

        /**
         * Load wizard internal configuration.
         *
         * @param {callback} onDoneCallback - on done callback.
         * @param {callback} onFailCallback - on fail callback.
         */
        loadConfiguration: function (onDoneCallback, onFailCallback) {
            var url = wizard.configuration.ajaxUrl + '?configure';

            wizard.ajaxCall(url, null, 'GET',
                function (data, textStatus, jqXHR) {
                    wizard.data.steps = data.steps;
                    wizard.data.stepIndex = data.stepIndex;

                    onDoneCallback(wizard.data.stepIndex);
                }, 
                function (jqXHR, textStatus, errorThrown) {
                    onFailCallback(jqXHR);
                });
        },

        /**
         * Trigger an action to the server.
         *
         * @param {string} action - action to send.
         * @param {string} method - http method.
         * @param {object} data - data to send.
         * @param {callback} onDoneCallback - on done callback.
         * @param {callback} onFailCallback - on fail callback.
         */
        triggerAction: function (action, method, data, 
            onDoneCallback, onFailCallback) {
            var url = wizard.configuration.ajaxUrl 
                + '?wizardAction=' + action
                + '&stepIndex=' + wizard.data.stepIndex;

            wizard.ajaxCall(url, data, method, 
                function (data, textStatus, jqXHR) {
                    onDoneCallback(data);
                }, 
                function (jqXHR, textStatus, errorThrown) {
                    onFailCallback(jqXHR);
                });
        },

        /**
         * Hide and show the wizard.
         *
         * @param {callback} onHideCallback - on hide callback.
         * @param {callback} onShowCallback - on show callback.
         */
        animate: function (onHideCallback, onShowCallback) {
            wizard.$el.container
                .animate({'opacity': 'toggle' }, 'slow', function () {
                    onHideCallback();
                    wizard.$el.container.animate({'opacity': 'toggle'}, 'slow', 
                        onShowCallback);
                });
        },

        /**
         * Initialize all actions in the current step.
         */
        setupActions: function () {
            wizard.$el.actions = $('button[data-wizard-action]');

            wizard.$el.actions.on('click.wizard', function (event) {
                var action = $(this).data('wizard-action');
                var formSelector = $(this).data('wizard-form');

                var $form = $(formSelector);

                var method = null == formSelector 
                    ? 'GET' : $form.attr('method');

                var data = wizard.buildData($form, $(this).data());

                wizard.triggerAction(action, method, data,
                    wizard.handleResponse, wizard.error);
            });
        },

        /**
         * Clear all the content and data of the current step.
         */
        clearContent: function () {
            for (var i in wizard.$el.content) {
                wizard.$el.content[i].empty();
            }

            for (var i in wizard.$el.actions) {
                wizard.$el.actions.unbind('click.wizard');
            }

            wizard.$el.content = [];
            wizard.$el.actions = [];
        },

        /**
         * Load the step in the wizard.
         *
         * @param {integer} stepIndex - index of the step.
         */
        loadStep: function (stepIndex) {
            var step = wizard.data.steps[stepIndex];
            wizard.data.stepIndex = stepIndex;

            wizard.animate(
                function () {
                    wizard.clearContent();

                    for (var i in step.content) {
                        var content = step.content[i];
                        var $target = $(content.target, wizard.$el.container);

                        if (null != content.view && content.view) {
                            $target.load(content.append);
                        } else {
                            $target.html(content.append);
                        }

                        wizard.$el.content.push($target);
                    }
                }, 
                function() {
                    wizard.setupActions();

                    wizard.$el.container.trigger('wizard:loadStep', 
                        [stepIndex, wizard.data.steps]);
                });
        },

        /**
         * Triggered when server responds.
         *
         * @param {object} response - contains response of the server.
         */
        handleResponse: function (response) {
            var type = response.status.type;
            var message = response.status.message;

            var stepIndex = response.stepIndex;

            if ('success' == type) {
                wizard.loadStep(stepIndex);
            }

            wizard.$el.container.trigger('wizard:' + type, 
                [message, response.body]);
        },

        /**
         * Triggered when errors occur.
         *
         * @param {object} jqXHR - contains error data.
         */
        error: function (jqXHR) {
            if (null != jqXHR.responseJSON) {
                var message = jqXHR.responseJSON.message;

                wizard.$el.container.trigger('wizard:error', [message]);
            }
        }
    };

    /**
     * Exports jquery plugin.
     */
    $.fn.wizard = wizard.init;
    $.fn.hideAction = wizard.hideAction;
    $.fn.showAction = wizard.showAction;

})(jQuery);
