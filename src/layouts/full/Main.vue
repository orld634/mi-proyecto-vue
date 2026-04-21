<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import sidebarItems from './vertical-sidebar/sidebarItem';
import NavGroup from './vertical-sidebar/NavGroup/index.vue';
import NavItem from './vertical-sidebar/NavItem/index.vue';
import Logo from './logo/Logo.vue';
// Icon Imports
import Upgradeversion from './vertical-sidebar/UpgradeBox/index.vue';
// dropdown imports
import NotificationDD from './vertical-header/NotificationDD.vue';
import ProfileDD from './vertical-header/ProfileDD.vue';
import { Icon } from '@iconify/vue';
const sidebarMenu = shallowRef(sidebarItems);
const sDrawer = ref(true);
</script>

<template>
    <!------Sidebar-------->
    <v-navigation-drawer left elevation="0"  app class="leftSidebar"  v-model="sDrawer">
        <!---Logo part -->
        <div class="pa-5">
            <Logo />
        </div>
        <!-- ---------------------------------------------- -->
        <!---Navigation -->
        <!-- ---------------------------------------------- -->
        <div>
        <perfect-scrollbar class="scrollnavbar">
            <v-list class="pa-6 pt-0">
                <!---Menu Loop -->
                <template v-for="(item, i) in sidebarMenu">
                    <!---Item Sub Header -->
                    <NavGroup :item="item" v-if="item.header" :key="item.title" />

                    <!---Single Item-->
                    <NavItem :item="item" v-else class="leftPadding" />
                    <!---End Single Item-->
                </template>
            </v-list>
            <div class="pa-4">
                <Upgradeversion/>
            </div>
        </perfect-scrollbar>
    </div>

    </v-navigation-drawer>
    <!------Header-------->
    <v-app-bar elevation="0" height="70" color="grey-darken-4" class="tech-navbar border-b" style="border-bottom-color: #00e676 !important; border-bottom-width: 2px !important;">
        <div class="d-flex align-center justify-space-between w-100 px-3">
            <div class="d-flex align-center">
                <v-btn class="hidden-lg-and-up ms-md-3 ms-sm-5 ms-3 text-white" @click="sDrawer = !sDrawer" icon variant="text"
                    size="small">
                    <Icon icon="solar:hamburger-menu-outline" height="24" style="color: #00e676"></Icon>
                </v-btn>
                
                <!-- Terminal-like Title -->
                <div class="d-none d-md-flex align-center ms-4 px-3 py-1 rounded server-status-box" style="background-color: #121212; border: 1px solid #333; font-family: 'Courier New', Courier, monospace;">
                    <span style="color: #00e676;" class="me-2 font-weight-bold">>_</span>
                    <span class="text-caption font-weight-bold" style="color: #e0e0e0; letter-spacing: 1px;">root@matdash:~# dashboard</span>
                </div>

                <!-- Notification -->
                <div class="ms-md-2" style="color: white !important;">
                    <NotificationDD />
                </div>

                <!-- System Status -->
                <v-chip size="small" class="ms-4 d-none d-sm-flex font-weight-bold" style="background-color: rgba(0, 230, 118, 0.1); border: 1px solid rgba(0, 230, 118, 0.5); color: #00e676; font-family: monospace;">
                    <Icon icon="solar:record-circle-bold" height="12" class="mr-1" style="animation: pulse-anim 2s infinite;"></Icon>
                    SYS_ONLINE
                </v-chip>
            </div>
            
            <div class="d-flex align-center gap-3">
                <!-- Tech Specs / Stats -->
                <div class="d-none d-lg-flex align-center gap-4 mr-4 px-4 py-1 rounded hardware-stats" style="background-color: #121212; border: 1px solid #333; font-family: monospace;">
                   <div class="text-caption d-flex align-center" style="color: #a1a1aa;"><Icon icon="solar:cpu-bold-duotone" class="mr-1" style="color: #29b6f6; font-size: 16px;" /> <span style="color: #fff;">12%</span></div>
                   <div class="text-caption d-flex align-center ms-3" style="color: #a1a1aa;"><Icon icon="solar:ram-bold-duotone" class="mr-1" style="color: #ffa726; font-size: 16px;" /> <span style="color: #fff;">2.4G</span></div>
                   <div class="text-caption d-flex align-center ms-3" style="color: #a1a1aa;"><Icon icon="solar:global-bold-duotone" class="mr-1" style="color: #ef5350; font-size: 16px;" /> <span style="color: #fff;">54ms</span></div>
                </div>

                <!-- User Profile -->
                <div style="color: white !important;">
                    <ProfileDD />
                </div>
            </div>
        </div>
    </v-app-bar>
</template>

<style scoped>
@keyframes pulse-anim {
    0% { opacity: 1; text-shadow: 0 0 4px #00e676; }
    50% { opacity: 0.5; text-shadow: none; }
    100% { opacity: 1; text-shadow: 0 0 4px #00e676; }
}

::v-deep .v-btn--icon.v-btn--density-default {
    color: white !important;
}
</style>
