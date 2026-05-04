// Barrel file — shared interactive components for the React migration.
// Import from '@/components/shared' for convenience.

// Editor
export { RichTextEditor } from './editor/RichTextEditor';

// Attachments
export { AttachmentUpload } from './attachments/AttachmentUpload';
export { AttachmentList } from './attachments/AttachmentList';
export { AttachmentPreview } from './attachments/AttachmentPreview';
export { AttachmentSortable } from './attachments/AttachmentSortable';

// Filter
export { FilterBar } from './filter/FilterBar';
export type {
  FilterOption,
  FilterCategory,
  ActiveFilter,
  SavedFilter,
} from './filter/FilterBar';

// History / Activity
export { ActivityFeed } from './history/ActivityFeed';

// Tags
export { TagDisplay } from './tags/TagDisplay';
export { TagEditor } from './tags/TagEditor';
export type { TagItem } from './tags/TagDisplay';

// Detail layout
export { DetailLayout, Section } from './detail/DetailLayout';

// Watchers
export { WatchersList } from './watchers/WatchersList';

// Vote
export { VoteButton } from './vote/VoteButton';

// Assign
export { AssignedSelector } from './assign/AssignedSelector';

// User selector lightbox
export { UserSelector } from './user-selector/UserSelector';

// Invite members
export { InviteMembersModal } from './invite-members/InviteMembersModal';

// Due date
export { DueDatePicker } from './due-date/DueDatePicker';

// Color selector
export { ColorSelector } from './color-selector/ColorSelector';
