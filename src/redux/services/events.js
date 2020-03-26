import { success } from '../../helpers/redux/actions';
import { createSelector } from 'reselect';

// action types
export const LOAD_SECTORS = 'LOAD_SECTORS';
export const SET_SELECTED_SECTORS = 'SET_SELECTED_SECTORS';
export const LOAD_EVENTS = 'LOAD_EVENTS';

const initialState = {
  sectors: {},
  events: {},
  selectedSectors: {},
  lastCheck: null
};

function select(state, action) {
  const { selectedSectors } = state;
  const { sectorId } = action.payload;
  const currSector = selectedSectors?.[sectorId];

  return {
    ...state,
    lastCheck: sectorId,
    selectedSectors: {
      ...state.selectedSectors,
      [sectorId]: currSector ? !currSector : true
    }
  };
}

function saveEvents(state, action) {
  const {
    payload,
    filters: { sector }
  } = action;

  return {
    ...state,
    lastCheck: null,
    events: {
      ...state.events,
      [sector]: payload
    }
  };
}

function saveSectors(state, action) {
  const { type, payload } = action;

  const sortedSectors = payload.sort((a, b) => b.events_count - a.events_count);
  debugger;
  return {
    ...state,
    sectors: Object.assign(
      ...sortedSectors.map((item, idx) => ({
        [item.id]: item
      }))
    ),
    selectedSectors: Object.assign(
      ...sortedSectors
        .filter((_, idx) => idx < 4)
        .map(item => ({ [item.id]: true }))
    )
  };
}
export function eventsReducer(state = initialState, action) {
  switch (action.type) {
    case success(LOAD_SECTORS):
      return saveSectors(state, action);

    case success(LOAD_EVENTS):
      return saveEvents(state, action);

    case SET_SELECTED_SECTORS:
      return select(state, action);

    default:
      return state;
  }
}

// actions
export function loadSectors(filters = {}) {
  return {
    createRequest: {
      url: '/organizations/sectors',
      filters
    },
    type: LOAD_SECTORS
  };
}

export function loadEvents(sector, region) {
  return {
    type: LOAD_EVENTS,
    createRequest: {
      url: '/news/events/',
      filters: {
        limit: 50,
        offset: 0,
        sector,
        region__initial: region
      }
    }
  };
}

export function selectSector(sectorId) {
  return {
    type: SET_SELECTED_SECTORS,
    payload: { sectorId }
  };
}

// selectors
export const getSectors = createSelector(
  globalState => globalState.eventsReducer,
  state =>
    Object.keys(state.sectors).length
      ? Object.keys(state.sectors)
          .map(key => state.sectors[key])
          .sort((a, b) => b.events_count - a.events_count)
      : []
);

export const getLastCheck = createSelector(
  globalState => globalState.eventsReducer,
  state => state.lastCheck
);

export const getEvents = createSelector(
  globalState => globalState.eventsReducer,
  state => state.events
);

export const getSelectedSectors = createSelector(
  globalState => globalState.eventsReducer,
  state => state.selectedSectors
);
