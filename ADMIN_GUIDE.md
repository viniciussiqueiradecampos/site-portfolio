# Admin Panel - Complete Access Guide

## 🎉 Your Admin Panel is Ready!

I've created a **complete, production-ready admin panel** with full access to manage all your portfolio content.

## 📍 Access URLs

- **Login**: `http://localhost:5173/admin`
- **Dashboard**: `http://localhost:5173/admin/dashboard` (after login)

## 🔐 Setup Authentication

### Step 1: Create Admin User in Supabase

1. Go to your Supabase dashboard
2. Click **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter:
   - **Email**: your-email@example.com
   - **Password**: (choose a strong password)
   - **Auto Confirm User**: ✅ YES
5. Click **Create User**

## ✨ Features

### 1. **Content Management**
Edit all text content:
- Hero Title ("figma • UI DESIGN...")
- Hero Description
- Storytelling Text

### 2. **Portfolio Projects**
- ➕ Add new projects
- ✏️ Edit existing projects
- 🗑️ Delete projects
- Manage:
  - Title
  - Image URL
  - Tags
  - Visibility
  - Order

### 3. **CV Sections**
- ➕ Add experience/education/skills
- ✏️ Edit sections
- 🗑️ Delete sections
- Manage:
  - Section type
  - Title & Subtitle
  - Date range
  - Description
  - Order

## 🎨 Admin Panel Features

✅ **Secure Login** - Supabase authentication
✅ **Beautiful UI** - Matches your site design
✅ **Real-time Updates** - Changes appear instantly
✅ **Modal Editors** - Clean editing experience
✅ **Success Messages** - Visual feedback
✅ **Responsive** - Works on all devices
✅ **Protected Routes** - Auto-redirect if not logged in

## 📝 How to Use

### Login
1. Go to `/admin`
2. Enter your email and password
3. Click **LOGIN**

### Edit Content
1. Click **CONTENT** tab
2. Edit any text field
3. Click **SAVE CHANGES**
4. ✅ Changes appear on your site immediately!

### Manage Projects
1. Click **PROJECTS** tab
2. Click **NEW PROJECT** or **Edit** on existing
3. Fill in:
   - Title
   - Image URL (can be local path or URL)
   - Tags (comma separated)
4. Click **SAVE**

### Manage CV
1. Click **CV** tab
2. Click **NEW SECTION** or **Edit** on existing
3. Select type (Experience/Education/Skills)
4. Fill in details
5. Click **SAVE**

## 🔒 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Only authenticated users can edit
- ✅ Public can only read published content
- ✅ Secure session management
- ✅ Auto-logout on session expire

## 🚀 Next Steps

1. **Install Supabase** (if not done):
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Setup Supabase** (follow `BACKEND_SETUP.md`)

3. **Create Admin User** (see above)

4. **Login & Start Editing!**
   - Go to `/admin`
   - Login with your credentials
   - Start managing your content!

## 💡 Pro Tips

- **Image URLs**: You can use:
  - Local paths: `/src/assets/project.png`
  - External URLs: `https://...`
  - Unsplash: `https://images.unsplash.com/...`

- **Tags**: Separate with commas
  - Example: `UI Design, Figma, Web`

- **Order**: Lower numbers appear first

- **Visibility**: Uncheck to hide from public site

## 🎯 What You Can Do Now

✅ Update hero text anytime
✅ Add/remove portfolio projects
✅ Manage your CV sections
✅ Change project images
✅ Reorder content
✅ Hide/show items
✅ All without touching code!

## 📱 Mobile Friendly

The admin panel works perfectly on:
- 💻 Desktop
- 📱 Tablet
- 📱 Mobile

## 🆘 Troubleshooting

**Can't login?**
- Check if you created the user in Supabase
- Verify email/password are correct
- Check `.env` has correct Supabase credentials

**Changes not appearing?**
- Refresh the public site
- Check if item is marked as "visible"
- Verify Supabase connection

**Need help?**
- Check browser console for errors
- Verify Supabase setup is complete
- Ask me! 😊

---

**You now have FULL ACCESS to manage your entire portfolio! 🎉**
