import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { GlassContainer, GlassView } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    // Store the layout dimensions of the tab bar to calculate item positions
    const [tabBarWidth, setTabBarWidth] = useState(0);

    const tabWidth = tabBarWidth / state.routes.length;
    // Calculate the horizontal position of the active tab bubble
    const activeTabOffset = tabWidth * state.index;

    return (
        <View style={styles.container}>
            <GlassContainer
                spacing={Platform.OS === 'ios' ? 12 : 8}
                style={[styles.glassContainer, { width: '100%' }]}
                onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)}
            >
                {/* The main background bar */}
                <GlassView style={styles.mainBar} glassEffectStyle="clear" />

                {/* The moving bubble for the active tab */}
                {tabBarWidth > 0 && (
                    <GlassView
                        style={[
                            styles.activeBubble,
                            {
                                width: tabWidth * 0.7, // Slightly larger horizontal feel
                                transform: [{ translateX: activeTabOffset + tabWidth * 0.15 }],
                            },
                        ]}
                        glassEffectStyle="clear"
                    />
                )}
            </GlassContainer>

            {/* The actual clickable icons (must be rendered OUTSIDE GlassContainer on iOS to be visible/clickable cleanly,
          or we use zIndex carefully. For the best interaction, we put them over the glass views.) */}
            <View style={styles.tabsContainer} pointerEvents="box-none">
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (Platform.OS === 'ios') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    return (
                        <Pressable
                            key={route.key}
                            onPressIn={onPress}
                            style={styles.tabButton}
                        >
                            {options.tabBarIcon && options.tabBarIcon({
                                focused: isFocused,
                                color: isFocused ? '#ffffff' : '#8A8A8E',
                                size: 28
                            })}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
        height: 65,
        justifyContent: 'center',
        zIndex: 100,
        elevation: 10,
    },
    glassContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
    },
    mainBar: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 32,
    },
    activeBubble: {
        position: 'absolute',
        top: 6,
        bottom: 6,
        borderRadius: 25,
        zIndex: 1, // Ensure it merges properly with mainBar
    },
    tabsContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
});
