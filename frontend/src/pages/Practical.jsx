import { useState } from 'react';
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SimulationProvider } from '../contexts/SimulationContext';
import { useSimulation } from '../contexts/useSimulation';
import Inventory from '../components/practical/Inventory';
import Canvas from '../components/practical/Canvas';
import ActionsPanel from '../components/practical/ActionsPanel';
import './Practical.css';

import { useData } from '../contexts/DataContext';
import WeightModal from '../components/practical/WeightModal';
import CameraRecorder from '../components/practical/CameraRecorder';

const PracticalSimulation = () => {
  const { placeUtensil, addHerbToUtensil } = useSimulation();
  const { isExamMode } = useData();
  const [activeItem, setActiveItem] = useState(null);
  const [pendingItem, setPendingItem] = useState(null);
  const [mobileTab, setMobileTab] = useState('inventory'); // 'inventory' | 'actions'

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event) => {
    setActiveItem(event.active.data.current);
  };

  const handleDragEnd = (event) => {
    const { over, active } = event;
    setActiveItem(null);
    
    if (!over) return;

    const itemData = active.data.current;
    if (!itemData) return;

    if (over.id === 'canvas-drop-zone' || over.id === 'utensil-drop-zone') {
      if (itemData.type === 'utensil') {
        placeUtensil(itemData);
      } else {
        setPendingItem(itemData);
      }
    }
  };

  const handleConfirmWeight = (amount) => {
    if (!pendingItem) return;
    addHerbToUtensil({ ...pendingItem, amount });
    setPendingItem(null);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="practical-container">
        {isExamMode && <CameraRecorder />}
        
        <div className={`inventory-sidebar-wrapper ${mobileTab === 'inventory' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <Inventory />
        </div>
        
        <Canvas />

        <div className="mobile-tabs-bar">
          <button 
            type="button"
            className={`mobile-tab-btn ${mobileTab === 'inventory' ? 'active' : ''}`} 
            onClick={() => setMobileTab('inventory')}
          >
            Inventory
          </button>
          <button 
            type="button"
            className={`mobile-tab-btn ${mobileTab === 'actions' ? 'active' : ''}`} 
            onClick={() => setMobileTab('actions')}
          >
            Actions & Recipes
          </button>
        </div>
        
        <div className={`actions-sidebar-wrapper ${mobileTab === 'actions' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <ActionsPanel />
        </div>
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="inventory-item overlay glass-panel" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
            {activeItem.image ? (
              <img src={activeItem.image} alt="" style={{width: 20, height: 20, marginRight: 8, borderRadius: 2}} />
            ) : (
              activeItem.type === 'utensil' ? '🥣' : activeItem.type === 'liquid' ? '💧' : '🌿'
            )} 
            {activeItem.name}
          </div>
        ) : null}
      </DragOverlay>

      {pendingItem && (
        <WeightModal 
          item={pendingItem} 
          onConfirm={handleConfirmWeight} 
          onCancel={() => setPendingItem(null)} 
        />
      )}
    </DndContext>
  );
};

const Practical = () => (
  <SimulationProvider>
    <PracticalSimulation />
  </SimulationProvider>
);

export default Practical;
