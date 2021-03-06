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

import TestConfig = require('../../test.config');
import { Util } from '../../util/util';
import { browser, by, element, protractor } from 'protractor';

export class SettingsPage {

    settingsURL = TestConfig.adf.url + TestConfig.adf.port + '/settings';
    providerDropdown = element(by.css('mat-select[id="adf-provider-selector"] div[class="mat-select-arrow-wrapper"]'));
    ecmAndBpm = {
        option: element(by.xpath('//SPAN[@class="mat-option-text"][contains(text(),"ALL")]')),
        text: 'ALL'
    };
    bpm = {
        option: element(by.xpath('//SPAN[@class="mat-option-text"][contains(text(),"BPM") and not (contains(text(),"and"))]')),
        text: 'BPM'
    };
    ecm = {
        option: element(by.xpath('//SPAN[@class="mat-option-text"][contains(text(),"ECM") and not (contains(text(),"and"))]')),
        text: 'ECM'
    };
    oauth = {
        option: element(by.xpath('//SPAN[@class="mat-option-text"][contains(text(),"OAUTH")]')),
        text: 'OAUTH'
    };
    selectedOption = element(by.css('span[class*="mat-select-value-text"]'));
    ecmText = element(by.css('input[data-automation-id*="ecmHost"]'));
    bpmText = element(by.css('input[data-automation-id*="bpmHost"]'));
    clientIdText = element(by.css('input[id="clientId"]'));
    authHostText = element(by.css('input[id="oauthHost"]'));
    basicAuthRadioButton = element(by.cssContainingText('mat-radio-button[id*="mat-radio"]', 'Basic Authentication'));
    identityHostText = element(by.css('input[id="identityHost"]'));
    ssoRadioButton = element(by.cssContainingText('[id*="mat-radio"]', 'SSO'));
    silentLoginToggleLabel = element(by.css('mat-slide-toggle[name="silentLogin"] label'));
    silentLoginToggleElement = element(by.css('mat-slide-toggle[name="silentLogin"]'));
    implicitFlowLabel = element(by.css('mat-slide-toggle[name="implicitFlow"] label'));
    implicitFlowElement = element(by.css('mat-slide-toggle[name="implicitFlow"]'));
    applyButton = element(by.css('button[data-automation-id*="host-button"]'));
    backButton = element(by.cssContainingText('button span[class="mat-button-wrapper"]', 'Back'));
    validationMessage = element(by.cssContainingText('mat-error', 'This field is required'));

    goToSettingsPage() {
        browser.waitForAngularEnabled(true);
        browser.driver.get(this.settingsURL);
        Util.waitUntilElementIsVisible(this.providerDropdown);
        return this;
    }

    setProvider(option, selected) {
        Util.waitUntilElementIsVisible(this.providerDropdown);
        this.providerDropdown.click();
        Util.waitUntilElementIsVisible(option);
        option.click();
        return expect(this.selectedOption.getText()).toEqual(selected);
    }

    getSelectedOptionText() {
        return this.selectedOption.getText();
    }

    getBpmHostUrl() {
        return this.bpmText.getAttribute('value');
    }

    getEcmHostUrl() {
        return this.ecmText.getAttribute('value');
    }

    getBpmOption() {
        return this.bpm.option;
    }

    getEcmOption() {
        return this.ecm.option;
    }

    getEcmAndBpmOption() {
        return this.ecmAndBpm.option;
    }

    setProviderEcmBpm() {
        this.goToSettingsPage();
        this.setProvider(this.ecmAndBpm.option, this.ecmAndBpm.text);
        Util.waitUntilElementIsVisible(this.bpmText);
        Util.waitUntilElementIsVisible(this.ecmText);
        this.clickApply();
        return this;
    }

    setProviderBpm() {
        this.goToSettingsPage();
        this.setProvider(this.bpm.option, this.bpm.text);
        Util.waitUntilElementIsVisible(this.bpmText);
        this.clickApply();
        return this;
    }

    setProviderEcm() {
        this.goToSettingsPage();
        this.setProvider(this.ecm.option, this.ecm.text);
        Util.waitUntilElementIsVisible(this.ecmText);
        expect(this.bpmText.isPresent()).toBe(false);
        this.clickApply();
        return this;
    }

    setProviderOauth() {
        this.goToSettingsPage();
        this.setProvider(this.oauth.option, this.oauth.text);
        Util.waitUntilElementIsVisible(this.bpmText);
        Util.waitUntilElementIsVisible(this.ecmText);
        expect(this.authHostText.isPresent()).toBe(true);
        this.clickApply();
        return this;
    }

    async clickBackButton() {
        Util.waitUntilElementIsVisible(this.backButton);
        await this.backButton.click();
    }

    async clickSsoRadioButton() {
        Util.waitUntilElementIsVisible(this.ssoRadioButton);
        await this.ssoRadioButton.click();
    }

    async setProviderEcmSso(contentServiceURL, authHost, identityHost, silentLogin = true, implicitFlow = true, clientId?: string) {
        this.goToSettingsPage();
        this.setProvider(this.ecm.option, this.ecm.text);
        Util.waitUntilElementIsNotOnPage(this.bpmText);
        Util.waitUntilElementIsVisible(this.ecmText);
        await this.clickSsoRadioButton();
        await this.setClientId(clientId);
        await this.setContentServicesURL(contentServiceURL);
        await this.setAuthHost(authHost);
        await this.setIdentityHost(identityHost);
        await this.setSilentLogin(silentLogin);
        await this.setImplicitFlow(implicitFlow);
        await this.clickApply();
    }

    async setProviderBpmSso(processServiceURL, authHost, identityHost, silentLogin = true, implicitFlow = true) {
        this.goToSettingsPage();
        this.setProvider(this.bpm.option, this.bpm.text);
        Util.waitUntilElementIsVisible(this.bpmText);
        Util.waitUntilElementIsNotOnPage(this.ecmText);
        await this.clickSsoRadioButton();
        await this.setClientId();
        await this.setProcessServicesURL(processServiceURL);
        await this.setAuthHost(authHost);
        await this.setIdentityHost(identityHost);
        await this.setSilentLogin(silentLogin);
        await this.setImplicitFlow(implicitFlow);
        await this.clickApply();
    }

    async setProcessServicesURL(processServiceURL) {
        Util.waitUntilElementIsVisible(this.bpmText);
        this.bpmText.clear();
        this.bpmText.sendKeys(processServiceURL);
    }

    async setClientId(clientId: string = TestConfig.adf_aps.clientIdSso) {
        Util.waitUntilElementIsVisible(this.clientIdText);
        this.clientIdText.clear();
        this.clientIdText.sendKeys(clientId);
    }

    async setContentServicesURL(contentServiceURL) {
        Util.waitUntilElementIsClickable(this.ecmText);
        this.ecmText.clear();
        this.ecmText.sendKeys(contentServiceURL);
    }

    clearContentServicesURL() {
        Util.waitUntilElementIsVisible(this.ecmText);
        this.ecmText.clear();
        this.ecmText.sendKeys('a');
        this.ecmText.sendKeys(protractor.Key.BACK_SPACE);
    }

    clearProcessServicesURL() {
        Util.waitUntilElementIsVisible(this.bpmText);
        this.bpmText.clear();
        this.bpmText.sendKeys('a');
        this.bpmText.sendKeys(protractor.Key.BACK_SPACE);
    }

    async setAuthHost(authHostURL) {
        Util.waitUntilElementIsVisible(this.authHostText);
        await this.authHostText.clear();
        await this.authHostText.sendKeys(authHostURL);
    }

    async setIdentityHost(identityHost) {
        Util.waitUntilElementIsVisible(this.identityHostText);
        await this.identityHostText.clear();
        await this.identityHostText.sendKeys(identityHost);
    }

    async clickApply() {
        Util.waitUntilElementIsVisible(this.applyButton);
        await this.applyButton.click();
    }

    async setSilentLogin(enableToggle) {
        await Util.waitUntilElementIsVisible(this.silentLoginToggleElement);

        const isChecked = (await this.silentLoginToggleElement.getAttribute('class')).includes('mat-checked');

        if (isChecked && !enableToggle || !isChecked && enableToggle) {
            return this.silentLoginToggleLabel.click();
        }

        return Promise.resolve();
    }

    async setImplicitFlow(enableToggle) {
        await Util.waitUntilElementIsVisible(this.implicitFlowElement);

        const isChecked = (await this.implicitFlowElement.getAttribute('class')).includes('mat-checked');

        if (isChecked && !enableToggle || !isChecked && enableToggle) {
            return this.implicitFlowLabel.click();
        }

        return Promise.resolve();
    }

    checkApplyButtonIsDisabled() {
        Util.waitUntilElementIsVisible(this.applyButton.getAttribute('disabled'));
        return this;
    }

    checkProviderDropdownIsDisplayed() {
        Util.waitUntilElementIsVisible(this.providerDropdown);
    }

    checkValidationMessageIsDisplayed() {
        Util.waitUntilElementIsVisible(this.validationMessage);
    }

    checkProviderOptions() {
        Util.waitUntilElementIsVisible(this.providerDropdown);
        this.providerDropdown.click();
        Util.waitUntilElementIsVisible(this.ecmAndBpm.option);
        Util.waitUntilElementIsVisible(this.ecm.option);
        Util.waitUntilElementIsVisible(this.bpm.option);
    }

    getBasicAuthRadioButton() {
        Util.waitUntilElementIsVisible(this.basicAuthRadioButton);
        return this.basicAuthRadioButton;
    }

    getSsoRadioButton() {
        Util.waitUntilElementIsVisible(this.ssoRadioButton);
        return this.ssoRadioButton;
    }

    getBackButton() {
        Util.waitUntilElementIsVisible(this.backButton);
        return this.backButton;
    }

    getApplyButton() {
        Util.waitUntilElementIsVisible(this.applyButton);
        return this.applyButton;
    }

    checkBasicAuthRadioIsSelected() {
        expect(this.getBasicAuthRadioButton().getAttribute('class')).toContain('mat-radio-checked');
    }

    checkSsoRadioIsNotSelected() {
        expect(this.getSsoRadioButton().getAttribute('class')).not.toContain('mat-radio-checked');
    }
}
