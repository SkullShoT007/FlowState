import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadXpFromDB, saveXpToDB, clearXpFromDB } from '../store/xpSlice';

/**
 * Custom hook for managing XP data with IndexedDB persistence
 * Handles loading XP data on component mount and provides utility functions
 */
export const useXpPersistence = () => {
    const dispatch = useDispatch();
    const xpState = useSelector(state => state.xpState);

    // Load XP data from IndexedDB when the hook is first used
    useEffect(() => {
        const loadXpData = async () => {
            try {
                await dispatch(loadXpFromDB()).unwrap();
            } catch (error) {
                console.error('Failed to load XP data:', error);
            }
        };

        loadXpData();
    }, [dispatch]);

    // Manual save function (useful for specific scenarios)
    const saveXpData = async () => {
        try {
            await dispatch(saveXpToDB(xpState)).unwrap();
            return true;
        } catch (error) {
            console.error('Failed to manually save XP data:', error);
            return false;
        }
    };

    // Reset XP data function
    const resetXpData = async () => {
        try {
            await dispatch(clearXpFromDB()).unwrap();
            return true;
        } catch (error) {
            console.error('Failed to reset XP data:', error);
            return false;
        }
    };

    // Calculate progress percentage for current level
    const getLevelProgress = () => {
        return Math.min((xpState.experience / xpState.nextLevelXp) * 100, 100);
    };

    // Calculate XP needed for next level
    const getXpToNextLevel = () => {
        return Math.max(xpState.nextLevelXp - xpState.experience, 0);
    };

    // Get XP statistics
    const getXpStats = () => {
        return {
            currentLevel: xpState.level,
            currentXp: xpState.experience,
            totalXp: xpState.totalxp,
            nextLevelXp: xpState.nextLevelXp,
            levelProgress: getLevelProgress(),
            xpToNextLevel: getXpToNextLevel(),
            isAtMaxLevel: xpState.level >= 100 // Example max level
        };
    };

    return {
        xpState,
        saveXpData,
        resetXpData,
        getLevelProgress,
        getXpToNextLevel,
        getXpStats
    };
};

export default useXpPersistence;
