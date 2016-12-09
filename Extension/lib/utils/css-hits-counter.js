/**
 * This file is part of Adguard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * Adguard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Adguard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Adguard Browser Extension.  If not, see <http://www.gnu.org/licenses/>.
 */

var CssHitsCounter = (function () { // jshint ignore:line

    'use strict';

    var onCssHitsFoundCallback;

    /**
     * Main calculation function.
     * 1. Select sub collection from elements.
     * 2. For each element from sub collection: retrieve calculated css 'content' attribute and if it contains 'adguard' marker then retrieve rule text and filter identifier.
     * 3. Start next task with some delay.
     *
     * @param elements Collection of all elements
     * @param start Start of batch
     * @param end End of batch
     * @param result Collection for save result
     * @param callback Finish callback
     */
    function countCssHitsBatch(elements, start, end, result, callback) {

        var length = Math.min(end, elements.length);
        for (var i = start; i < length; i++) {

            var element = elements[i];
            var style = getComputedStyle(element);
            var content = style.content;
            if (!content || content.indexOf('adguard') < 0) {
                continue;
            }

            var filterIdAndRuleText = decodeURIComponent(content);
            // 'content' value includes open and close quotes.
            filterIdAndRuleText = filterIdAndRuleText.substring(8, content.length - 1);
            // Attribute 'content' in css looks like: {content: 'adguard{filterId};{ruleText}'}
            var index = filterIdAndRuleText.indexOf(';');
            if (index < 0) {
                continue;
            }
            var filterId = filterIdAndRuleText.substring(0, index);
            var ruleText = filterIdAndRuleText.substring(index + 1);
            result.push({
                filterId: filterId,
                ruleText: ruleText
            });
        }

        if (length === elements.length) {
            callback(result);
            return;
        }

        start = end;
        end += 100;

        // Start next task with some delay
        setTimeout(function () {
            countCssHitsBatch(elements, start, end, result, callback);
        }, 50);
    }

    /**
     * This function divides calculation process into tasks.
     * When calculation finishes, sends results to background page.
     * See countCssHitsBatch for details.
     */
    function countCssHits() {

        var elements = document.querySelectorAll('*');
        countCssHitsBatch(elements, 0, 100, [], function (result) {
            if (result.length > 0) {
                onCssHitsFoundCallback(result);
            }
        });
    }

    /**
     * Invoke countCssHits with delay.
     * Delay is 2 seconds
     */
    function countCssHitsLater() {

        // Cleanup event listener
        removeEventListener('load', countCssHitsLater);

        setTimeout(countCssHits, 2000);
    }

    /**
     * This function prepares calculation of css hits.
     * We are waiting for 'load' event and start calculation.
     */
    var count = function () {
        // 'load' has already fired
        if (document.readyState === 'complete') {
            countCssHitsLater();
        } else {
            addEventListener('load', countCssHitsLater);
        }
    };

    /**
     * Sets callback that is fired on css hits.
     * @param callback Callback function
     */
    var setCssHitsFoundCallback = function (callback) {
        if (typeof callback !== 'function') {
            throw new Error('Wrong callback type');
        }
        onCssHitsFoundCallback = callback;
    };

    return {
        count: count,
        setCssHitsFoundCallback: setCssHitsFoundCallback
    };

})();