import {element, browser, by} from 'protractor';

import {monitoring} from './helpers/monitoring';
import {globalSearch} from './helpers/search';
import {workspace} from './helpers/workspace';
import {authoring} from './helpers/authoring';
import {el} from './helpers/e2e-helpers';

describe('package', () => {
    beforeEach(() => {
        monitoring.openMonitoring();
    });

    it('increment package version', () => {
        monitoring.actionOnItem('Edit', 3, 0);
        // Add item to current package.
        monitoring.actionOnItemSubmenu('Add to current', 'main', 2, 0);
        // Save package
        authoring.save();
        // Check version number.
        authoring.showVersions();
        expect(element.all(by.repeater('version in versions')).count()).toBe(2);
        authoring.showVersions(); // close version panel
    });

    it('add to current package removed', () => {
        monitoring.actionOnItem('Edit', 3, 0);
        monitoring.actionOnItemSubmenu('Add to current', 'main', 2, 0);
        // Open menu.
        var menu = monitoring.openItemMenu(2, 0);
        var header = menu.element(by.partialLinkText('Add to current'));

        expect(header.isPresent()).toBeFalsy();
        // Close menu.
        menu.element(by.css('.dropdown__menu-close')).click();
    });

    it('reorder group package items', () => {
        monitoring.actionOnItem('Edit', 3, 0);
        monitoring.actionOnItemSubmenu('Add to current', 'main', 2, 0);
        monitoring.actionOnItemSubmenu('Add to current', 'story', 3, 2);
        // Reorder item on package
        authoring.moveToGroup('MAIN', 0, 'STORY', 0);
        expect(authoring.getGroupItems('MAIN').count()).toBe(0);
        expect(authoring.getGroupItems('STORY').count()).toBe(2);
    });

    it('create package from multiple items', () => {
        monitoring.selectItem(2, 0);
        monitoring.selectItem(2, 1);
        monitoring.createPackageFromItems();
        expect(authoring.getGroupItems('MAIN').count()).toBe(2);
    });

    it('create package by combining an item with open item', () => {
        monitoring.openAction(2, 1);
        browser.sleep(500);
        monitoring.actionOnItem('Combine with current', 3, 0);
        expect(authoring.getGroupItems('MAIN').count()).toBe(2);
    });

    it('add multiple items to package', () => {
        monitoring.actionOnItem('Edit', 3, 0);
        monitoring.selectItem(2, 0);
        monitoring.selectItem(3, 1);
        browser.sleep(200);

        el(['multi-actions-inline', 'Add to Current Package']).click();
        browser.sleep(200);
        expect(authoring.getGroupItems('MAIN').count()).toBe(2);
    });

    it('create package from published item', () => {
        expect(monitoring.getTextItem(2, 0)).toBe('item5');
        monitoring.actionOnItem('Edit', 2, 0);
        authoring.writeText('some text');
        authoring.save();
        authoring.publish();
        monitoring.showSearch();
        globalSearch.setListView();
        globalSearch.showCustomSearch();
        globalSearch.toggleSearchTabs('filters');
        globalSearch.toggleByType('text');
        expect(globalSearch.getTextItem(0)).toBe('item5');
        globalSearch.actionOnItem('Create package', 0);
        expect(authoring.getGroupItems('MAIN').count()).toBe(1);
    });

    xit('sets package item label', () => {
        workspace.selectDesk('Politic Desk');
        expect(monitoring.getTextItem(3, 1)).toBe('package2');
        monitoring.actionOnItem('Edit', 3, 1);
        monitoring.getPackageItemActionDropdown(0).click();
        browser.actions()
            .mouseMove(monitoring.getPackageItemLabelEntry())
            .perform();
        monitoring.getPackageItemLabelOption(1).click();
        expect(monitoring.getPackageItemLabel(0).getText()).toBe('Featured');
    });

    xit('can preview package in a package', () => {
        monitoring.actionOnItem('Edit', 3, 0);
        monitoring.actionOnItemSubmenu('Add to current', 'main', 3, 1);
        authoring.save();
        authoring.close();
        monitoring.previewAction(3, 0);
        // There is no preview in preview, SD-3319
    });
});
