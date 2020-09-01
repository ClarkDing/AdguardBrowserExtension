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

// TODO fix scriptlets library to expose Redirects class
import { redirects } from 'scriptlets';
const Redirects = redirects.Redirects;

/**
 * Redirects service class
 */
export const redirectFilterService = (function () {
    let redirects = null;

    /**
     * Initialize service
     */
    const init = (rawYaml) => {
        redirects = new Redirects(rawYaml);
    };

    /**
     * Creates url
     *
     * @param title
     * @return string|null
     */
    const createRedirectUrl = (title) => {
        if (!title) {
            return null;
        }

        const redirectSource = redirects.getRedirect(title);
        if (!redirectSource) {
            adguard.console.debug(`There is no redirect source with title: "${title}"`);
            return null;
        }

        return adguard.utils.resources.createRedirectFileUrl(redirectSource.file);
    };

    const hasRedirect = (title) => {
        return !!redirects.getRedirect(title);
    };

    return {
        init,
        hasRedirect,
        createRedirectUrl,
    };
})();
