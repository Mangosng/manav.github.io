import { useState, useMemo } from 'react';
import TeamModal from './TeamModal';
import { SHOOTER_TYPES, CLIMB_OPTIONS } from '../../lib/scouting';

const TeamList = ({ teams, teamStats, teamYearStats = {}, scoutingData, eventKey, onScoutingUpdate }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [sortBy, setSortBy] = useState('number');
  const [sortDir, setSortDir] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state - arrays for each category
  const [shooterFilters, setShooterFilters] = useState([]);
  const [climbFilters, setClimbFilters] = useState([]);
  const [feedingFilter, setFeedingFilter] = useState(false);
  const [trenchFilter, setTrenchFilter] = useState(false);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir(field === 'epa' || field === 'opr' ? 'desc' : 'asc'); // Default high-to-low for EPA/OPR
    }
  };

  const toggleFilter = (category, value) => {
    if (category === 'shooter') {
      setShooterFilters(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    } else if (category === 'climb') {
      setClimbFilters(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    }
  };

  const clearFilters = () => {
    setShooterFilters([]);
    setClimbFilters([]);
    setFeedingFilter(false);
    setTrenchFilter(false);
  };

  const hasActiveFilters = shooterFilters.length > 0 || climbFilters.length > 0 || feedingFilter || trenchFilter;

  // Helper to get EPA value from various data sources
  const getEpaValue = (teamNumber) => {
    // Event-specific stats
    const eventStats = teamStats[teamNumber];
    if (eventStats?.epa?.total) return eventStats.epa.total;
    
    // Year stats from Statbotics API
    const yearStats = teamYearStats[teamNumber];
    if (yearStats?.epa?.total_points?.mean) return yearStats.epa.total_points.mean;
    
    return 0;
  };

  // Filter teams
  const filteredTeams = useMemo(() => {
    if (!hasActiveFilters) return teams;

    return teams.filter(team => {
      const scout = scoutingData[team.team_number];
      if (!scout) return false; // Only scouted teams can pass filters

      // Check shooter filter (OR within category)
      if (shooterFilters.length > 0) {
        if (!shooterFilters.includes(scout.shooter_type)) return false;
      }

      // Check climb filter (OR within category)
      if (climbFilters.length > 0) {
        if (!climbFilters.includes(scout.climb)) return false;
      }

      // Check feeding filter
      if (feedingFilter && !scout.feeding) return false;

      // Check trench filter
      if (trenchFilter && !scout.trench) return false;

      return true;
    });
  }, [teams, scoutingData, shooterFilters, climbFilters, feedingFilter, trenchFilter, hasActiveFilters]);

  // Sort teams
  const sortedTeams = useMemo(() => {
    return [...filteredTeams].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'number':
          aVal = a.team_number;
          bVal = b.team_number;
          break;
        case 'epa':
          aVal = getEpaValue(a.team_number);
          bVal = getEpaValue(b.team_number);
          break;
        case 'opr':
          // Use event OPR or fall back to 0
          aVal = teamStats[a.team_number]?.opr || 0;
          bVal = teamStats[b.team_number]?.opr || 0;
          break;
        case 'scouted':
          aVal = scoutingData[a.team_number] ? 1 : 0;
          bVal = scoutingData[b.team_number] ? 1 : 0;
          break;
        default:
          aVal = a.team_number;
          bVal = b.team_number;
      }

      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredTeams, sortBy, sortDir, teamStats, teamYearStats, scoutingData]);

  const SortButton = ({ field, label }) => (
    <button
      onClick={() => handleSort(field)}
      className={`text-xs uppercase tracking-terminal px-2 py-1 border transition-none ${
        sortBy === field 
          ? 'bg-highlight text-invert border-highlight' 
          : 'border-structure hover:bg-highlight hover:text-invert'
      }`}
    >
      {label} {sortBy === field && (sortDir === 'asc' ? '↑' : '↓')}
    </button>
  );

  const FilterCheckbox = ({ checked, onClick, label }) => (
    <button
      onClick={onClick}
      className={`text-xs uppercase tracking-terminal px-2 py-1 border transition-none text-left ${
        checked 
          ? 'bg-highlight text-invert border-highlight' 
          : 'border-structure hover:bg-highlight hover:text-invert'
      }`}
    >
      {checked ? '[*]' : '[ ]'} {label}
    </button>
  );

  // Helper to get stats display info for a team
  const getStatsDisplay = (teamNumber) => {
    const eventStats = teamStats[teamNumber];
    const yearStats = teamYearStats[teamNumber];

    // Priority 1: Event EPA (if available)
    if (eventStats?.epa?.total) {
      return {
        epa: eventStats.epa.total,
        unitless: null,
        opr: eventStats.opr || null,
        label: 'EPA',
        year: null,
        rank: null,
        isCurrent: true,
      };
    }

    // Priority 2: Year stats from Statbotics
    if (yearStats) {
      const epa = yearStats.epa?.total_points?.mean;
      const unitless = yearStats.epa?.unitless;
      const rank = yearStats.epa?.ranks?.total?.rank;
      const dataYear = yearStats.dataYear;
      
      if (dataYear === 2026 && epa) {
        // Current year data - show EPA + unitless
        return {
          epa: epa,
          unitless: unitless,
          opr: null,
          label: 'EPA',
          year: 2026,
          rank: null,
          isCurrent: true,
        };
      } else if (rank) {
        // Previous year - show rank + unitless
        return {
          epa: epa,
          unitless: unitless,
          opr: null,
          label: `${dataYear} RANK`,
          year: dataYear,
          rank: rank,
          isCurrent: false,
        };
      } else if (epa) {
        // Has EPA but no rank
        return {
          epa: epa,
          unitless: unitless,
          opr: null,
          label: `${dataYear} EPA`,
          year: dataYear,
          rank: null,
          isCurrent: false,
        };
      }
    }

    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <span className="text-xs uppercase tracking-terminal text-ink/70 py-1">SORT:</span>
        <SortButton field="number" label="TEAM #" />
        <SortButton field="epa" label="EPA" />
        <SortButton field="opr" label="OPR" />
        <SortButton field="scouted" label="SCOUTED" />
      </div>

      {/* Filter Toggle */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`text-xs uppercase tracking-terminal px-4 py-2 border transition-none ${
            showFilters || hasActiveFilters
              ? 'bg-highlight text-invert border-highlight' 
              : 'border-structure hover:bg-highlight hover:text-invert'
          }`}
        >
          {showFilters ? '[*] FILTERS' : '[ ] FILTERS'}
          {hasActiveFilters && ` (${shooterFilters.length + climbFilters.length + (feedingFilter ? 1 : 0) + (trenchFilter ? 1 : 0)} ACTIVE)`}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs uppercase tracking-terminal px-3 py-2 ml-2 border border-structure hover:bg-highlight hover:text-invert transition-none"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="border border-structure p-4 mb-6 space-y-4">
          {/* Shooter Type Filters */}
          <div>
            <p className="text-xs uppercase tracking-terminal text-ink/70 mb-2">SHOOTER TYPE:</p>
            <div className="flex flex-wrap gap-2">
              {SHOOTER_TYPES.map(type => (
                <FilterCheckbox
                  key={type}
                  checked={shooterFilters.includes(type)}
                  onClick={() => toggleFilter('shooter', type)}
                  label={type}
                />
              ))}
            </div>
          </div>

          {/* Climb Filters */}
          <div>
            <p className="text-xs uppercase tracking-terminal text-ink/70 mb-2">CLIMB LEVEL:</p>
            <div className="flex flex-wrap gap-2">
              {CLIMB_OPTIONS.map(option => (
                <FilterCheckbox
                  key={option}
                  checked={climbFilters.includes(option)}
                  onClick={() => toggleFilter('climb', option)}
                  label={option}
                />
              ))}
            </div>
          </div>

          {/* Boolean Filters */}
          <div>
            <p className="text-xs uppercase tracking-terminal text-ink/70 mb-2">CAPABILITIES:</p>
            <div className="flex flex-wrap gap-2">
              <FilterCheckbox
                checked={feedingFilter}
                onClick={() => setFeedingFilter(!feedingFilter)}
                label="FEEDING"
              />
              <FilterCheckbox
                checked={trenchFilter}
                onClick={() => setTrenchFilter(!trenchFilter)}
                label="TRENCH"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <p className="text-center text-xs uppercase tracking-terminal text-ink/70 mb-4">
        SHOWING {sortedTeams.length} OF {teams.length} TEAMS
      </p>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedTeams.map((team) => {
          const scout = scoutingData[team.team_number];
          const statsDisplay = getStatsDisplay(team.team_number);
          
          return (
            <button
              key={team.team_number}
              onClick={() => setSelectedTeam(team)}
              className="border border-structure p-4 text-left hover:bg-highlight hover:text-invert hover:border-highlight transition-none group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg font-bold">{team.team_number}</span>
                {statsDisplay && (
                  <div className="text-right flex flex-col gap-1">
                    {statsDisplay.isCurrent ? (
                      // 2026 data: show EPA + unitless
                      <>
                        <span className="text-xs uppercase tracking-terminal bg-canvas group-hover:bg-highlight px-2 py-1 border border-structure group-hover:border-invert">
                          EPA: {statsDisplay.epa?.toFixed(1)}
                        </span>
                        {statsDisplay.unitless && (
                          <span className="text-xs uppercase tracking-terminal text-ink/50 group-hover:text-invert/50">
                            UNITLESS: {statsDisplay.unitless.toFixed(0)}
                          </span>
                        )}
                      </>
                    ) : statsDisplay.rank ? (
                      // Previous year: show rank + unitless
                      <>
                        <span className="text-xs uppercase tracking-terminal bg-canvas group-hover:bg-highlight px-2 py-1 border border-structure group-hover:border-invert">
                          {statsDisplay.label}: #{statsDisplay.rank}
                        </span>
                        {statsDisplay.unitless && (
                          <span className="text-xs uppercase tracking-terminal text-ink/50 group-hover:text-invert/50">
                            {statsDisplay.year} EPA: {statsDisplay.unitless.toFixed(0)}
                          </span>
                        )}
                      </>
                    ) : statsDisplay.epa ? (
                      <span className="text-xs uppercase tracking-terminal bg-canvas group-hover:bg-highlight px-2 py-1 border border-structure group-hover:border-invert">
                        {statsDisplay.label}: {statsDisplay.epa.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
              <div className="text-xs uppercase tracking-terminal truncate mb-1">
                {team.nickname}
              </div>
              <div className="text-xs tracking-terminal text-ink/50 group-hover:text-invert/50 truncate mb-2">
                {[team.city, team.state_prov, team.country].filter(Boolean).join(', ')}
              </div>
              {/* OPR display if available from event stats */}
              {teamStats[team.team_number]?.opr && (
                <div className="text-xs tracking-terminal text-ink/50 group-hover:text-invert/50 mb-2">
                  OPR: {teamStats[team.team_number].opr.toFixed(1)}
                </div>
              )}
              {scout ? (
                <div className="text-xs uppercase tracking-terminal text-green-600 group-hover:text-green-300">
                  [*] SCOUTED
                  {scout.shooter_type && <span className="ml-2 text-ink/50 group-hover:text-invert/50">| {scout.shooter_type}</span>}
                </div>
              ) : (
                <div className="text-xs uppercase tracking-terminal text-ink/50 group-hover:text-invert/50">
                  [ ] NOT SCOUTED
                </div>
              )}
            </button>
          );
        })}
      </div>

      {sortedTeams.length === 0 && (
        <p className="text-center text-sm text-ink/70 uppercase tracking-terminal py-8">
          [ NO TEAMS MATCH FILTERS ]
        </p>
      )}

      {/* Team Modal */}
      {selectedTeam && (
        <TeamModal
          team={selectedTeam}
          teamStats={teamStats[selectedTeam.team_number]}
          scoutingData={scoutingData[selectedTeam.team_number]}
          eventKey={eventKey}
          onClose={() => setSelectedTeam(null)}
          onSave={(data) => {
            onScoutingUpdate(selectedTeam.team_number, data);
          }}
        />
      )}
    </div>
  );
};

export default TeamList;
