import React from 'react';
import Input from './Input';
import Button from './Button';

// Type for the possible filter statuses
type FilterStatus = 'all' | 'completed' | 'incomplete';

// Interface for the component's props
interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
}

// Apply the props interface to the component
const SearchFilter = ({ searchTerm, onSearchChange, filterStatus, onFilterChange }: SearchFilterProps) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <Input
      type="text"
      placeholder="Search todos by title..."
      value={searchTerm}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
      className="flex-1"
      aria-label="Search todos"
    />
    <div className="flex space-x-2">
      <Button
        onClick={() => onFilterChange('all')}
        variant={filterStatus === 'all' ? 'default' : 'outline'}
        aria-pressed={filterStatus === 'all'}
      >
        All
      </Button>
      <Button
        onClick={() => onFilterChange('completed')}
        variant={filterStatus === 'completed' ? 'default' : 'outline'}
        aria-pressed={filterStatus === 'completed'}
      >
        Completed
      </Button>
      <Button
        onClick={() => onFilterChange('incomplete')}
        variant={filterStatus === 'incomplete' ? 'default' : 'outline'}
        aria-pressed={filterStatus === 'incomplete'}
      >
        Incomplete
      </Button>
    </div>
  </div>
);

export default SearchFilter;

