import { useContext } from 'react';
import { SimulationContext } from './SimulationContext';

export const useSimulation = () => useContext(SimulationContext);
