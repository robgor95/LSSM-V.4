import tailoredTabsTitle from './components/tailoredTabs/settings-titles.vue';
import tailoredTabsItem from './components/tailoredTabs/settings-item.vue';

import missionKeywordsTitle from './components/missionKeywords/settings-titles.vue';
import missionKeywordsItem from './components/missionKeywords/settings-item.vue';

import alarmIconsTitle from './components/alarmIcons/settings-titles.vue';
import alarmIconsItem from './components/alarmIcons/settings-item.vue';
import { ModuleMainFunction } from 'typings/Module';

export default (async (LSSM, MODULE_ID, $m) => {
    const defaultTailoredTabs = Object.values(
        $m('tailoredTabs.defaultTabs')
    ).map(({ name, vehicleTypes }) => ({
        name,
        vehicleTypes: Object.values(vehicleTypes),
    })) as {
        name: string;
        vehicleTypes: number[];
    }[];

    await LSSM.$store.dispatch('settings/register', {
        moduleId: MODULE_ID,
        settings: {
            generationDate: {
                type: 'toggle',
                default: true,
            },
            yellowBorder: {
                type: 'number',
                default: 0,
                min: 0,
                max: 48,
                dependsOn: '.generationDate',
            },
            redBorder: {
                type: 'toggle',
                default: false,
                dependsOn: '.generationDate',
            },
            enhancedMissingVehicles: {
                type: 'toggle',
                default: false,
            },
            patientSummary: {
                type: 'toggle',
                default: true,
            },
            arrCounter: {
                type: 'toggle',
                default: false,
            },
            arrClickHighlight: {
                type: 'toggle',
                default: false,
            },
            arrClickHighlightColor: {
                type: 'color',
                default: '#008000',
                dependsOn: '.arrClickHighlight',
            },
            arrClickHighlightWidth: {
                type: 'number',
                default: 2,
                dependsOn: '.arrClickHighlight',
            },
            arrCounterResetSelection: {
                type: 'toggle',
                default: false,
            },
            arrMatchHighlight: {
                type: 'toggle',
                default: false,
            },
            arrTime: {
                type: 'toggle',
                default: false,
            },
            arrSpecs: {
                type: 'toggle',
                default: false,
            },
            alarmTime: {
                type: 'toggle',
                default: false,
            },
            stickyHeader: {
                type: 'toggle',
                default: false,
            },
            loadMoreVehiclesInHeader: {
                type: 'toggle',
                default: false,
            },
            hideVehicleList: {
                type: 'toggle',
                default: false,
            },
            centerMap: {
                type: 'toggle',
                default: false,
            },
            tailoredTabs: {
                type: 'appendable-list',
                default: defaultTailoredTabs,
                listItemComponent: tailoredTabsItem,
                titleComponent: tailoredTabsTitle,
                defaultItem: {
                    name: '',
                    vehicleTypes: [],
                },
            },
            missionKeywords: {
                type: 'appendable-list',
                default: [],
                listItemComponent: missionKeywordsItem,
                titleComponent: missionKeywordsTitle,
                defaultItem: {
                    keyword: '',
                    color: '#777777',
                    prefix: false,
                    missions: [],
                },
            },
            alarmIcons: {
                type: 'appendable-list',
                default: [],
                listItemComponent: alarmIconsItem,
                titleComponent: alarmIconsTitle,
                defaultItem: {
                    icon: '',
                    type: 'fas',
                    vehicleTypes: [],
                },
            },
            overlay: {
                type: 'hidden',
                default: false,
            },
            minified: {
                type: 'hidden',
                default: false,
            },
            textMode: {
                type: 'hidden',
                default: false,
            },
        },
    });

    if (
        !window.location.pathname.match(/^\/(missions|buildings)\/\d+$\/?/) ||
        document.querySelector('.missionNotFound')
    )
        return;
    const stagingMode = !!window.location.pathname.match(
        /^\/buildings\/\d+\/?$/
    );
    if (stagingMode && !document.getElementById('education_schooling_-1'))
        return;
    const getSetting = <returnType = boolean>(
        settingId: string
    ): Promise<returnType> => {
        return LSSM.$store.dispatch('settings/getSetting', {
            moduleId: MODULE_ID,
            settingId,
        });
    };

    if (!stagingMode) {
        await LSSM.$store.dispatch('addStyle', {
            selectorText: '.vehicle_prisoner_select a.btn-danger',
            style: {
                'pointer-events': 'none',
                'opacity': '0.65',
            },
        });

        if (await getSetting('generationDate'))
            (
                await import(
                    /* webpackChunkName: "modules/extendedCallWindow/generationDate" */ './assets/generationDate'
                )
            ).default(
                LSSM,
                await getSetting<number>('yellowBorder'),
                await getSetting('redBorder')
            );
        if (await getSetting('enhancedMissingVehicles'))
            (
                await import(
                    /* webpackChunkName: "modules/extendedCallWindow/enhancedMissingVehicles" */ './assets/enhancedMissingVehicles'
                )
            ).default(LSSM, $m);
        if (await getSetting('patientSummary'))
            (
                await import(
                    /* webpackChunkName: "modules/extendedCallWindow/patientSummary" */ './assets/patientSummary'
                )
            ).default(LSSM);
        if (
            (await getSetting('arrCounter')) ||
            (await getSetting('arrClickHighlight')) ||
            (await getSetting('arrCounterResetSelection'))
        )
            await (
                await import(
                    /* webpackChunkName: "modules/extendedCallWindow/arrCounter" */ './assets/arrCounter'
                )
            ).default(LSSM, getSetting, $m);

        const missionKeywordsSettings = await getSetting<
            {
                keyword: string;
                color: string;
                prefix: boolean;
                missions: number[];
            }[]
        >('missionKeywords');

        if (missionKeywordsSettings.length)
            (
                await import(
                    /* webpackChunkName: "modules/extendedCallWindow/missionKeywords" */ './assets/missionKeywords'
                )
            ).default(LSSM, missionKeywordsSettings);

        if (await getSetting('arrMatchHighlight'))
            (
                await import(
                    /* webpackChunkName: "modules/extendedCallWindow/arrMatchHighlight" */ './assets/arrMatchHighlight'
                )
            ).default(LSSM);
        if (await getSetting('alarmTime'))
            (
                await import(
                    /* webpackChunkName: "modules/extendedCallWindow/alarmTime" */ './assets/alarmTime'
                )
            ).default(LSSM);

        const alarmIconsSettings = await getSetting<
            {
                icon: string;
                type: 'fas' | 'far' | 'fab';
                vehicleTypes: (number | string)[];
            }[]
        >('alarmIcons');
        if (alarmIconsSettings.length)
            (
                await import(
                    /* webpackChunkName: "modules/extendedCallWindow/alarmIcons" */ './assets/alarmIcons'
                )
            ).default(LSSM, alarmIconsSettings);

        const arrSpecs = await getSetting('arrSpecs');
        const arrTime = await getSetting('arrTime');
        if (arrSpecs || arrTime)
            (
                await import(
                    /* webpackChunkName: "modules/extendedCallWindow/arrHover" */ './assets/arrHover'
                )
            ).default(LSSM, arrSpecs, arrTime, MODULE_ID, $m);

        const stickyHeader = await getSetting('stickyHeader');
        const loadMoreVehiclesInHeader = await getSetting(
            'loadMoreVehiclesInHeader'
        );
        if (stickyHeader || loadMoreVehiclesInHeader)
            (
                await import(
                    /* webpackChunkName: "modules/extendedCallWindow/enhancedHeader" */ './assets/enhancedHeader'
                )
            ).default(stickyHeader, loadMoreVehiclesInHeader);
        if (await getSetting('hideVehicleList'))
            (
                await import(
                    /* webpackChunkName: "modules/extendedCallWindow/hideVehicleList" */ './assets/hideVehicleList'
                )
            ).default(LSSM, MODULE_ID, $m);
        if (await getSetting('centerMap'))
            (
                await import(
                    /* webpackChunkName: "modules/extendedCallWindow/centerMap" */ './assets/centerMap'
                )
            ).default(LSSM);
    }

    const tailoredTabSettings = await getSetting<typeof defaultTailoredTabs>(
        'tailoredTabs'
    );
    if (
        !(
            await import(
                /* webpackChunkName: "node_modules/lodash/isEqual" */ 'lodash/isEqual'
            )
        ).default(tailoredTabSettings, defaultTailoredTabs) ||
        stagingMode
    )
        (
            await import(
                /* webpackChunkName: "modules/extendedCallWindow/tailoredTabs" */ './assets/tailoredTabs'
            )
        ).default(LSSM, tailoredTabSettings, stagingMode, $m);
}) as ModuleMainFunction;
