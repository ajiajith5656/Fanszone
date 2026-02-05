# User Profile Page Guide

## Overview
The User Profile Page is a comprehensive profile management interface that displays and allows editing of all user information collected during the signup process.

## Features

### 1. Profile Photo Gallery
- Displays up to 3 profile photos
- Main photo shows prominently (left column, spans 2 rows)
- Additional photos in grid format
- Edit mode allows photo uploads (hover shows "Change" overlay)
- Photos sourced from `signupData.images` array

### 2. Verification Status Banner
- Shows current verification status: **Pending**, **Approved**, or **Not Verified**
- Color-coded styling:
  - Pending: Orange banner
  - Approved: Green banner
  - Not verified: Gray banner
- **"Verify Now" button** - Available for unverified users to complete verification
- Status update via `verificationStatus` state

### 3. Personal Information Section
- **Full Name** - Text input (editable)
- **Date of Birth** - Date picker (editable)
  - Displays age calculation alongside date: "Jan 15, 2000 (Age: 24)"
- **Gender** - Dropdown selector (editable)
  - Options: Male, Female, Non-binary, Other
- **Email** - Display only (cannot be changed)
- **Location** - Text input for city/country (editable)

### 4. About Me Section
- **Bio** - Text area for personal description (editable)
- Up to 500 characters recommended
- Markdown support for future enhancement

### 5. Dating Preferences Section
- **Looking For** - Dropdown selector (editable)
  - Options: Men, Women, Everyone
- **Relationship Type** - Dropdown selector (editable)
  - Options: Long-term, Short-term, Friendship, Casual

### 6. Interests Section
- Grid display of 12 selectable interests:
  - Travel, Music, Movies, Sports, Reading, Gaming
  - Cooking, Photography, Art, Fitness, Dancing, Pets
- Edit mode: Click chips to toggle selection
- View mode: Selected interests display as tags
- Minimum 3 interests required (from signup validation)

## Component Structure

### ProfileView Component
Located in [src/features/dashboard/Dashboard.tsx](src/features/dashboard/Dashboard.tsx#L280)

```typescript
interface ProfileViewProps {
  signupData: {
    name: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    lookingFor: string;
    relationshipType: string;
    interests: string[];
    images: File[];
    bio?: string;
    location?: string;
  }
}
```

### State Management
Profile data is managed locally with the following state:
```typescript
const [isEditing, setIsEditing] = useState(false);
const [profile, setProfile] = useState({...});
const [verificationStatus] = useState<string>("pending");
```

### Key Functions

#### handleSave()
```typescript
const handleSave = async () => {
  try {
    await apiService.updateUserProfile(profile);
    setIsEditing(false);
  } catch (err) {
    console.error("Failed to update profile", err);
  }
};
```
- Calls backend API to persist profile changes
- Exits edit mode on successful save
- Handles errors gracefully

#### handleVerifyNow()
```typescript
const handleVerifyNow = () => {
  // Navigate to verification or trigger verification modal
  console.log("Verify now clicked");
};
```
- Triggered when user clicks "Verify Now" button
- Should navigate to verification flow or open modal

#### toggleInterest()
```typescript
const toggleInterest = (interest: string) => {
  setProfile(prev => ({
    ...prev,
    interests: prev.interests.includes(interest)
      ? prev.interests.filter((i: string) => i !== interest)
      : [...prev.interests, interest]
  }));
};
```
- Adds/removes interests from selection
- Works with click handlers on interest chips in edit mode

## Styling

### CSS Classes
- `.profile-view` - Main container
- `.section-header` - Title and edit button
- `.profile-images-grid` - Photo gallery
- `.verification-banner` - Status indicator
- `.profile-form` - Form sections container
- `.form-section` - Individual form sections
- `.form-field` - Single form field
- `.profile-input` - Text/date input styling
- `.profile-textarea` - Multi-line text input
- `.interests-grid` - Interests chip container
- `.interest-chip` - Individual interest selector
- `.interest-tag` - Interest display in view mode

### Theme
- Background: Dark gradient (matches dashboard theme)
- Text: Light colors for dark backgrounds
- Accent: Purple gradient (#667eea to #764ba2)
- Primary actions: Gradient buttons
- Hover states: Opacity and transform transitions

## Data Flow

### Profile Load
```
AuthContext (signupData)
    ↓
ProfileView Component
    ↓
Local profile state
```

### Profile Save
```
User clicks "Save"
    ↓
handleSave()
    ↓
apiService.updateUserProfile(profile)
    ↓
Backend API
    ↓
Profile updated in database
```

### Verification
```
User clicks "Verify Now"
    ↓
handleVerifyNow()
    ↓
Navigate to VerificationStep
    ↓
User uploads verification documents
    ↓
Verification status updates
```

## API Integration

### Backend Endpoints Required

1. **GET /api/user/profile**
   - Fetch full user profile
   - Response includes all profile fields

2. **PUT /api/user/profile**
   - Update user profile
   - Body: Profile object with updated fields
   - Response: Updated profile

3. **POST /api/user/verify**
   - Initiate verification process
   - Uploads verification documents
   - Response: Verification status

### Current Implementation
- `apiService.updateUserProfile(profile)` - Called on save
- `apiService.getUserRole()` - Already implemented for auth
- Verification endpoint: Still needs implementation

## Usage

### Accessing the Profile
1. User logs in
2. Dashboard displays
3. Click "Profile" tab in bottom navigation
4. ProfileView component renders with user data

### Editing Profile
1. Click "Edit" button in section header
2. Form fields become editable
3. Modify desired fields
4. Click "Save" to persist changes
5. Click "Edit" again to cancel

### Managing Photos
1. In edit mode, click photo to change
2. Upload new image
3. Confirm selection
4. Click "Save"

### Updating Interests
1. Click "Edit" button
2. Click interest chips to toggle selection
3. Selected interests show purple background
4. Click "Save" to persist

### Verification
1. If verification status is "pending" or "not verified"
2. Click "Verify Now" button
3. Complete identity verification
4. Status updates to "approved"

## Future Enhancements
- [ ] Image cropping and optimization
- [ ] Markdown support in bio
- [ ] Location autocomplete
- [ ] Interest suggestions based on profile
- [ ] Social media linking
- [ ] Badge system for verified users
- [ ] Profile completion percentage indicator
- [ ] Profile visibility settings
- [ ] Block/report user functionality

## Troubleshooting

### Profile not loading
- Check AuthContext.signupData is populated
- Verify apiService is properly configured
- Check browser console for errors

### Edit mode not working
- Ensure isEditing state is toggling properly
- Check form field onChange handlers
- Verify browser console for JavaScript errors

### Save failing
- Check network tab for API errors
- Verify backend endpoint is available
- Check authentication token is valid
- Review error logs in console

### Images not displaying
- Verify File objects are being stored correctly in signupData
- Check URL.createObjectURL() working in browser
- Verify file MIME types are valid

## Testing Checklist
- [ ] Profile loads with correct data from signupData
- [ ] Edit button toggles edit/view mode
- [ ] All form fields editable in edit mode
- [ ] Save button persists changes to database
- [ ] Interests toggle selection properly
- [ ] Verification banner shows correct status
- [ ] "Verify Now" button visible for unverified users
- [ ] Photos display correctly
- [ ] Form validation works (email read-only, interests min 3)
- [ ] Mobile responsive design works
- [ ] Dark theme styling consistent with dashboard
