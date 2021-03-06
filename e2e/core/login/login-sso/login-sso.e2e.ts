/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LoginSSOPage } from '@alfresco/adf-testing';
import { SettingsPage } from '../../../pages/adf/settingsPage';
import TestConfig = require('../../../test.config');
import { browser } from 'protractor';
import { NavigationBarPage } from '../../../pages/adf/navigationBarPage';
import { LoginPage } from '../../../pages/adf/loginPage';

describe('Login component - SSO', () => {

    const settingsPage = new SettingsPage();
    const loginApsPage = new LoginSSOPage();
    const loginPage = new LoginPage();
    const navigationBarPage = new NavigationBarPage();
    let silentLogin, implicitFlow;

    describe('Login component - SSO implicit Flow', () => {

        afterEach(() => {
            navigationBarPage.clickLogoutButton();
            browser.executeScript('window.sessionStorage.clear();');
            browser.executeScript('window.localStorage.clear();');
        });

        it('[C261050] Should be possible login with SSO', () => {
            settingsPage.setProviderEcmSso(TestConfig.adf.url, TestConfig.adf.hostSso, TestConfig.adf.hostIdentity, false, true, 'alfresco');
            loginApsPage.clickOnSSOButton();
            loginApsPage.loginSSOIdentityService(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
        });

        it('[C280667] Should be redirect directly to keycloak without show the login page with silent login', () => {
            settingsPage.setProviderEcmSso(TestConfig.adf.url, TestConfig.adf.hostSso, TestConfig.adf.hostIdentity, true, true, 'alfresco');
            loginApsPage.loginSSOIdentityService(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
        });
    });

    describe('SSO Login Error for login component', () => {

        it('[C299205] Should display the login error message when the SSO identity service is wrongly configured', () => {
            settingsPage.setProviderEcmSso(TestConfig.adf.url, 'http://aps22/auth/realms/alfresco', TestConfig.adf.hostIdentity, false, true, 'alfresco');
            loginApsPage.clickOnSSOButton();
            loginApsPage.checkLoginErrorIsDisplayed();
            expect(loginApsPage.getLoginErrorMessage()).toContain('SSO Authentication server unreachable');
        });
    });

    describe('Login component - SSO Grant type password (implicit flow false)', () => {

        it('[C299158] Should be possible to login with SSO, with  grant type password (Implicit Flow false)', () => {
            implicitFlow = false;
            settingsPage.setProviderEcmSso(TestConfig.adf.url, TestConfig.adf.hostSso, TestConfig.adf.hostIdentity, silentLogin, implicitFlow, 'alfresco');

            loginPage.waitForElements();

            settingsPage.setProviderEcmSso(TestConfig.adf.url, TestConfig.adf.hostSso, TestConfig.adf.hostIdentity, silentLogin, implicitFlow, 'alfresco');
            browser.ignoreSynchronization = true;

            loginPage.enterUsername(TestConfig.adf.adminEmail);
            loginPage.enterPassword(TestConfig.adf.adminPassword);
            loginPage.clickSignInButton();

            let isDisplayed = false;

            browser.wait(() => {
                loginPage.header.isDisplayed().then(
                    () => {
                        isDisplayed = true;
                    },
                    () => {
                        isDisplayed = false;
                    }
                );
                return isDisplayed;
            }, TestConfig.main.timeout, 'Element is not visible ' + loginPage.header.locator());
        });
    });

});
