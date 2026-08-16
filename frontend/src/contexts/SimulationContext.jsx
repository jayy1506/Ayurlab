import { createContext, useState, useCallback } from 'react';
import { validateSimulation } from '../utils/validationLogic';
import { useData } from './DataContext';
import { logUserActivity } from '../utils/activityTracker';

const SimulationContext = createContext();
export { SimulationContext };

export const SimulationProvider = ({ children }) => {
  const { recipes } = useData();

  // The one utensil placed in the centre of the canvas
  const [activeUtensil, setActiveUtensil]     = useState(null);
  // Herbs inside the utensil: [{...itemData, form:'hard'|'powder'|'liquid'|...}]
  const [herbsInUtensil, setHerbsInUtensil]   = useState([]);
  // Sequential log of user actions for recipe validation
  const [actionSequence, setActionSequence]   = useState([]);
  // Which action is currently animating
  const [currentAction, setCurrentAction]     = useState(null);
  // Last validation result
  const [simulationResult, setSimulationResult] = useState(null);
  // Time-lapse configuration { realSeconds: number, equals: number, unit: string }
  const [timelapse, setTimelapse] = useState({ realSeconds: 2, equals: 1, unit: 'minute' });

  // Duration each action animation plays (in ms)
  const actionDurationMs = timelapse.realSeconds * 1000;

  /* ── validation helper ──────────────────────────────────────────── */
  const _validate = useCallback((seq) => {
    const result = validateSimulation(seq, recipes);
    
    if (result.success === true) {
      const recipe = recipes.find(r => r.id === result.compoundId);
      if (recipe) {
        logUserActivity({
          type: 'practical',
          colorClass: 'green',
          title: 'Completed experiment',
          detail: recipe.name,
          link: '/practical'
        });

        // Transform all herbs into a single final compound object
        setHerbsInUtensil([{
          id: recipe.id,
          name: recipe.name,
          type: 'compound',
          form: recipe.finalForm || 'powder',
          uniqueId: `final_${recipe.id}_${Date.now()}`
        }]);
      }
    }

    if (result.message || result.success === true || result.success === false) {
      setSimulationResult(result);
    }
    return result;
  }, [recipes]);

  /* ── place a utensil onto the canvas ───────────────────────────── */
  const placeUtensil = useCallback((item) => {
    setActiveUtensil(item);
    setHerbsInUtensil([]);
    setActionSequence([]);
    setSimulationResult({ success: null, message: `🫙 ${item.name} placed. Now drag herbs inside it.` });
  }, []);

  /* ── drop a herb / liquid INTO the utensil ─────────────────────── */
  const addHerbToUtensil = useCallback((item) => {
    if (!activeUtensil) {
      setSimulationResult({ success: false, message: '⚠️ Place a utensil first before adding ingredients.' });
      return;
    }
    const form = item.type === 'liquid' ? 'liquid' : 'hard';
    const herbEntry = { ...item, form, uniqueId: `${item.id}_${Date.now()}` };
    setHerbsInUtensil(prev => [...prev, herbEntry]);

    const newSeq = [...actionSequence, { action: 'add', item: item.id, amount: item.amount || 0 }];
    setActionSequence(newSeq);
    _validate(newSeq);
  }, [activeUtensil, actionSequence, _validate]);

  /* ── apply a lab action (grind / heat / mix etc.) ──────────────── */
  const applyAction = useCallback((actionId) => {
    if (!activeUtensil) {
      setSimulationResult({ success: false, message: '⚠️ Place a utensil first.' });
      return;
    }
    setCurrentAction(actionId);
    setSimulationResult({ success: null, message: null });

    setTimeout(() => {
      // Visually transform herbs based on the action applied
      setHerbsInUtensil(prev => prev.map(h => {
        if (actionId === 'grind')     return { ...h, form: 'powder' };
        if (actionId === 'heat')      return { ...h, form: h.type === 'liquid' ? 'boiling' : h.form };
        if (actionId === 'sieve')     return { ...h, form: h.form === 'hard' ? 'powder' : h.form };
        if (actionId === 'filter')    return { ...h, form: 'liquid' };
        if (actionId === 'mix')       return { ...h, form: h.form === 'powder' ? 'mixed_powder' : h.form };
        if (actionId === 'form_pills') return { ...h, form: 'pill' };
        return h;
      }));

      const newSeq = [...actionSequence, { action: actionId }];
      setActionSequence(newSeq);
      setCurrentAction(null);
      _validate(newSeq);
    }, actionDurationMs);
  }, [activeUtensil, actionSequence, actionDurationMs, _validate]);

  /* ── remove a single herb chip ─────────────────────────────────── */
  const removeHerb = useCallback((uniqueId) => {
    setHerbsInUtensil(prev => prev.filter(h => h.uniqueId !== uniqueId));
  }, []);

  /* ── reset everything ──────────────────────────────────────────── */
  const resetCanvas = useCallback(() => {
    setActiveUtensil(null);
    setHerbsInUtensil([]);
    setActionSequence([]);
    setCurrentAction(null);
    setSimulationResult(null);
  }, []);

  return (
    <SimulationContext.Provider value={{
      activeUtensil, placeUtensil,
      herbsInUtensil, addHerbToUtensil, removeHerb,
      currentAction, applyAction,
      simulationResult,
      timelapse, setTimelapse,
      resetCanvas,
      actionSequence,
    }}>
      {children}
    </SimulationContext.Provider>
  );
};
