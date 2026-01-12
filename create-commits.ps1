# Script to create ~50 commits by organizing files logically
Write-Host "Creating organized commits to reach ~50 total..." -ForegroundColor Cyan

# Unstage everything first
git reset

# Commit 1: Documentation
git add README.md .gitignore
git commit -m "docs: Add project documentation and gitignore"

# Commit 2-3: Backend setup
git add backend/package.json backend/package-lock.json
git commit -m "chore: Initialize backend dependencies"

git add backend/server.js backend/.gitignore
git commit -m "feat: Setup Express server configuration"

# Commit 4-5: Backend middleware and models
git add backend/middleware/
git commit -m "feat: Add authentication middleware"

git add backend/models/User.js backend/models/Product.js
git commit -m "feat: Add User and Product data models"

# Commit 6-8: More models
git add backend/models/Cart.js backend/models/Order.js
git commit -m "feat: Add Cart and Order models"

git add backend/models/Wishlist.js
git commit -m "feat: Add Wishlist model"

git add backend/models/ActivationRequest.js backend/models/Feedback.js backend/models/FooterContent.js
git commit -m "feat: Add ActivationRequest, Feedback, and FooterContent models"

# Commit 9-14: Backend routes
git add backend/routes/auth.js
git commit -m "feat: Implement user authentication routes"

git add backend/routes/users.js
git commit -m "feat: Implement user management routes"

git add backend/routes/products.js
git commit -m "feat: Implement product CRUD routes"

git add backend/routes/cart.js
git commit -m "feat: Implement shopping cart routes"

git add backend/routes/orders.js
git commit -m "feat: Implement order management routes"

git add backend/routes/wishlist.js
git commit -m "feat: Implement wishlist routes"

# Commit 15-17: Additional routes
git add backend/routes/activationRequests.js
git commit -m "feat: Implement seller activation request routes"

git add backend/routes/feedback.js
git commit -m "feat: Implement feedback routes"

git add backend/routes/footer.js
git commit -m "feat: Implement footer content routes"

# Commit 18: Scripts
git add backend/scripts/
git commit -m "feat: Add admin password reset utility"

# Commit 19-20: Frontend setup
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: Initialize frontend dependencies"

git add frontend/public/ frontend/.gitignore
git commit -m "feat: Add frontend public assets and HTML template"

# Commit 21-23: Frontend core
git add frontend/src/index.js frontend/src/index.css
git commit -m "feat: Setup React application entry point"

git add frontend/src/App.js
git commit -m "feat: Implement main App component with routing"

git add frontend/src/context/
git commit -m "feat: Add authentication context provider"

# Commit 24-25: Frontend styles
git add frontend/src/styles/
git commit -m "feat: Add global styles, colors, and fonts"

git add frontend/src/utils/
git commit -m "feat: Add image utility functions"

# Commit 26-27: Auth components
git add frontend/src/components/Auth/Login.js frontend/src/components/Auth/Login.css
git commit -m "feat: Implement login component with styling"

git add frontend/src/components/Auth/VerifyEmail.js
git commit -m "feat: Add email verification component"

# Commit 28-29: Landing and Loading
git add frontend/src/components/Landing/
git commit -m "feat: Implement landing page component"

git add frontend/src/components/Loading/
git commit -m "feat: Add loading spinner component"

# Commit 30-32: Dashboard components
git add frontend/src/components/Dashboard/BuyerDashboard.js
git commit -m "feat: Implement buyer dashboard"

git add frontend/src/components/Dashboard/SellerDashboard.js
git commit -m "feat: Implement seller dashboard"

git add frontend/src/components/Dashboard/AdminDashboard.js frontend/src/components/Dashboard/Dashboard.css
git commit -m "feat: Implement admin dashboard with shared styles"

# Commit 33-34: Home components
git add frontend/src/components/Home/BuyerHome.js frontend/src/components/Home/BuyerHome.css
git commit -m "feat: Implement buyer home page"

git add frontend/src/components/Home/SellerHome.js frontend/src/components/Home/SellerHome.css
git commit -m "feat: Implement seller home page"

# Commit 35-36: Cart and Wishlist
git add frontend/src/components/Cart/
git commit -m "feat: Implement shopping cart component"

git add frontend/src/components/Wishlist/
git commit -m "feat: Implement wishlist component"

# Commit 37-38: History components
git add frontend/src/components/History/BuyHistory.js
git commit -m "feat: Implement buy history component"

git add frontend/src/components/History/SellHistory.js frontend/src/components/History/History.css
git commit -m "feat: Implement sell history with styling"

# Commit 39-41: Activation and Pages
git add frontend/src/components/ActivationRequest/
git commit -m "feat: Implement seller activation request component"

git add frontend/src/components/Pages/AboutPage.js frontend/src/components/Pages/ContactPage.js
git commit -m "feat: Add About and Contact pages"

git add frontend/src/components/Pages/ShopPage.js frontend/src/components/Pages/FeedbackPage.js frontend/src/components/Pages/HelpPage.js frontend/src/components/Pages/Pages.css
git commit -m "feat: Add Shop, Feedback, and Help pages with shared styles"

# Commit 42-44: Special components
git add frontend/src/components/Footer/
git commit -m "feat: Implement footer component"

git add frontend/src/components/ImageViewer360.css frontend/src/components/ImageViewer360.js
git commit -m "feat: Add 360-degree image viewer component"

git add frontend/src/components/Product360Viewer/
git commit -m "feat: Add product 360 viewer component"

# Commit 45-47: Advanced features
git add frontend/src/components/VirtualAssistant/
git commit -m "feat: Implement virtual assistant component"

git add frontend/src/components/RulesAndRegulation/
git commit -m "feat: Add rules and regulations component"

git add frontend/src/components/PrivateRoute.js
git commit -m "feat: Add private route protection component"

# Commit 48-49: UI components
git add frontend/src/components/Toast.css frontend/src/components/Toast.js frontend/src/components/ToastContainer.js
git commit -m "feat: Add toast notification system"

# Commit 50: Installation scripts
git add install-all.bat push-to-github.bat push-to-github.ps1
git commit -m "chore: Add installation and deployment scripts"

# Commit 51+: Documentation files
git add ADMIN_LOGIN_GUIDE.md DEPLOYMENT.md
git commit -m "docs: Add admin login and deployment guides"

git add ERROR_FIXES.md FIX_ADMIN_PASSWORD.md RESTART_SERVER.md
git commit -m "docs: Add troubleshooting and maintenance guides"

git add FEATURES_COMPLETED.md FEATURE_VERIFICATION_REPORT.md
git commit -m "docs: Add feature completion and verification reports"

git add FINAL_VERIFICATION.md NOTIFICATION_AND_HISTORY_VERIFICATION.md
git commit -m "docs: Add verification and testing documentation"

git add PROJECT_FEATURES_CHECKLIST.md PROPOSAL_VERIFICATION.md
git commit -m "docs: Add project checklist and proposal verification"

git add GITHUB_PUSH_INSTRUCTIONS.md QUICK_PUSH_GUIDE.md
git commit -m "docs: Add GitHub push and deployment instructions"

Write-Host "`nCommit creation completed!" -ForegroundColor Green
$commitCount = git rev-list --all --count
Write-Host "Total commits: $commitCount" -ForegroundColor Cyan
