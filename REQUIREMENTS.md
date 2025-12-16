# RecallCards - Volere Requirements Specification

**Document Version:** 1.0  
**Date:** 2024  
**Project:** RecallCards - Modern Flashcard Learning Platform  
**Website:** https://recallcards.net

---

## 1. PROJECT DRIVERS

### 1.1 The Purpose of the Project

RecallCards is a modern, web-based flashcard learning platform designed to help users memorize and review educational content efficiently. The system provides an intuitive interface for creating, managing, and reviewing flashcards with progress tracking capabilities.

### 1.2 Stakeholders

| Stakeholder | Role | Interest |
|------------|------|----------|
| End Users | Primary Users | Students, learners, professionals seeking to memorize information |
| Developers | Development Team | Building and maintaining the platform |
| System Administrators | Operations | Deploying and maintaining infrastructure |

### 1.3 Mandated Constraints

1. **Technology Stack Constraints:**
   - Frontend: React 18.2, Vite 5.4, Tailwind CSS 3.4
   - Backend: Flask 2.2.2, Python 3.9+
   - Database: MongoDB 7.0
   - Authentication: Auth0
   - Deployment: Docker, Docker Compose, Nginx

2. **Platform Constraints:**
   - Must be accessible via web browser (desktop, tablet, mobile)
   - Must support HTTPS with SSL certificates
   - Must be deployable using Docker containers

3. **Security Constraints:**
   - All API endpoints must authenticate using Auth0 JWT tokens
   - User data must be isolated per user account
   - CORS must be properly configured

4. **Performance Constraints:**
   - Page load time < 3 seconds
   - API response time < 500ms
   - Support concurrent users

### 1.4 Naming Conventions and Terminology

- **Flashcard**: A card containing a term (front) and definition (answer) on the back
- **Review State**: A flashcard marked for additional review (suffix: "FFFLASHBACKCARDS")
- **Mastered Card**: A flashcard that has been successfully learned
- **Learning Card**: A flashcard currently in review state
- **User Email**: Used as unique identifier for user accounts

### 1.5 Relevant Facts and Assumptions

**Facts:**
- Users access the platform via web browsers
- Data is stored in MongoDB document database
- Authentication is handled by Auth0 service
- Application is deployed using Docker containers

**Assumptions:**
- Users have stable internet connection
- Users have modern web browsers (Chrome, Firefox, Safari, Edge)
- Users have Auth0 accounts or can create them
- MongoDB database is accessible and properly configured

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Authentication & Authorization

#### FR-1: User Authentication
**Priority:** Critical  
**Description:** The system shall allow users to authenticate using Auth0.

**Rationale:** Secure user authentication is essential for data privacy and user account management.

**Dependencies:** Auth0 service configuration

**Test Cases:**
- User can log in with Auth0 credentials
- User is redirected to dashboard after successful login
- User session persists across page refreshes

#### FR-2: Development Mode Authentication Bypass
**Priority:** Medium  
**Description:** The system shall support bypassing Auth0 authentication in development mode when `VITE_BYPASS_AUTH=true`.

**Rationale:** Facilitates local development without requiring Auth0 setup.

**Dependencies:** Environment variable configuration

**Test Cases:**
- When `VITE_BYPASS_AUTH=true`, user can access protected routes without Auth0 login
- Mock user is provided in development mode

#### FR-3: Protected Routes
**Priority:** Critical  
**Description:** The system shall protect certain routes and require authentication before access.

**Rationale:** Ensures only authenticated users can access user-specific features.

**Protected Routes:**
- `/home` - Dashboard
- `/addword` - Add flashcard page
- `/flashcards` - Review flashcards page
- `/progress` - Progress tracking page
- `/profile` - User profile page

**Test Cases:**
- Unauthenticated users are redirected to login
- Authenticated users can access all protected routes

#### FR-4: User Logout
**Priority:** High  
**Description:** The system shall provide a logout function that terminates the user session.

**Rationale:** Users need to securely log out of their accounts.

**Test Cases:**
- User can click logout button
- User session is terminated
- User is redirected to landing page

---

### 2.2 Landing Page & Navigation

#### FR-5: Unauthenticated Landing Page
**Priority:** High  
**Description:** The system shall display a landing page for unauthenticated users with:
- Hero section with main title
- Three feature cards (horizontally aligned, stacked below title)
- Call-to-action buttons to sign up/login
- No navigation bar visible

**Rationale:** Provides introduction to the platform and encourages user registration.

**Test Cases:**
- Landing page displays correctly for unauthenticated users
- Feature cards are properly aligned
- Login buttons redirect to Auth0

#### FR-6: Authenticated Dashboard
**Priority:** High  
**Description:** The system shall display a dashboard for authenticated users with:
- Welcome section with personalized greeting
- Three action cards: "Start Reviewing", "Add Card", "View Stats"
- Gradient background from primary to accent color
- Navigation bar visible

**Rationale:** Provides quick access to main features for authenticated users.

**Test Cases:**
- Dashboard displays user's email/name
- Action cards link to correct pages
- Navigation bar is visible

#### FR-7: Navigation Bar
**Priority:** High  
**Description:** The system shall provide a navigation bar for authenticated users with:
- Home link
- Profile link
- Logout button
- User information display

**Rationale:** Enables easy navigation between different sections of the application.

**Test Cases:**
- Navigation bar appears only for authenticated users
- All links work correctly
- Logout button functions properly

---

### 2.3 Flashcard Management

#### FR-8: Create Flashcard
**Priority:** Critical  
**Description:** The system shall allow authenticated users to create flashcards with:
- Term (front of card) - required field
- Definition (back of card) - required field
- Character counter for both fields
- Form validation
- Toast notification on success/error

**Rationale:** Core functionality - users must be able to create flashcards.

**API Endpoint:** `POST /api/sendwords`

**Request Format:**
```json
{
  "token": "user@example.com",
  "word": "term",
  "ans": "definition"
}
```

**Test Cases:**
- User can submit valid flashcard
- Empty fields are rejected
- Success notification appears
- Card is saved to database

#### FR-9: View Random Flashcard
**Priority:** Critical  
**Description:** The system shall allow authenticated users to view a random flashcard for review.

**Rationale:** Users need to review flashcards in random order for effective learning.

**API Endpoint:** `GET /api/words/rand/<email>`

**Response Format:**
```json
["term", "definition"]
```

**Test Cases:**
- Random card is fetched successfully
- Card displays term on front
- Card can be flipped to show definition
- Empty state message appears when no cards exist

#### FR-10: Flip Card Animation
**Priority:** High  
**Description:** The system shall provide a 3D flip animation when users click on a flashcard to reveal the definition.

**Rationale:** Enhances user experience with engaging visual feedback.

**Test Cases:**
- Card flips smoothly on click
- Animation is visually appealing
- Card state persists during flip

#### FR-11: Edit Flashcard
**Priority:** High  
**Description:** The system shall allow authenticated users to edit existing flashcards:
- Edit mode toggle
- Input fields for term and definition
- Save and Cancel buttons
- Toast notification on success

**Rationale:** Users need to correct mistakes or update card content.

**API Endpoint:** `POST /api/editword`

**Request Format:**
```json
{
  "token": "user@example.com",
  "oldword": "old_term",
  "word": "new_term",
  "ans": "new_definition"
}
```

**Test Cases:**
- User can enter edit mode
- Changes can be saved
- Changes can be cancelled
- Success notification appears

#### FR-12: Delete Flashcard
**Priority:** High  
**Description:** The system shall allow authenticated users to delete flashcards via dropdown menu.

**Rationale:** Users need to remove unwanted or incorrect flashcards.

**API Endpoint:** `DELETE /api/delword/<word>`

**Request Format:**
```json
{
  "token": "user@example.com"
}
```

**Test Cases:**
- User can access delete option
- Confirmation prevents accidental deletion
- Card is removed from database
- Success notification appears

#### FR-13: Review Status Management
**Priority:** Critical  
**Description:** The system shall allow users to mark flashcards as:
- "I Know This" - marks card as mastered (removes review suffix)
- "Need Review" - marks card for review (adds "FFFLASHBACKCARDS" suffix)

**Rationale:** Enables spaced repetition learning technique.

**API Endpoint:** `POST /api/editword`

**Test Cases:**
- "I Know This" removes review status
- "Need Review" adds review status
- Review badge appears on cards in review state
- Status persists across sessions

#### FR-14: Next Card Navigation
**Priority:** High  
**Description:** The system shall provide a "Next Card" button to fetch a new random flashcard.

**Rationale:** Enables continuous review sessions.

**Test Cases:**
- Button fetches new random card
- Card state resets (flipped to front)
- Edit mode is disabled when fetching new card

---

### 2.4 Progress Tracking

#### FR-15: Display Progress Statistics
**Priority:** High  
**Description:** The system shall display progress statistics including:
- Total Cards count
- Reviewed Cards count
- Mastered Cards count
- Learning Cards count

**Rationale:** Users need to track their learning progress.

**API Endpoint:** `GET /api/words`

**Test Cases:**
- Statistics are calculated correctly
- Counts update when cards are added/modified
- Empty state displays zero counts

#### FR-16: Display Progress Bars
**Priority:** High  
**Description:** The system shall display progress bars for:
- Mastery Progress (mastered cards / total cards)
- Review Progress (reviewed cards / total cards)

**Rationale:** Visual representation of progress motivates users.

**Test Cases:**
- Progress bars display correct percentages
- Bars update when statistics change
- Percentage calculations are accurate

#### FR-17: Progress Page Layout
**Priority:** Medium  
**Description:** The system shall display progress page with:
- Four stat cards in a grid (Total, Reviewed, Mastered, Learning)
- Two progress bar cards below the stat cards
- Proper spacing and alignment
- Responsive design for mobile/tablet

**Rationale:** Organized layout improves readability.

**Test Cases:**
- Cards are properly aligned
- Layout is responsive
- Spacing is consistent

---

### 2.5 User Interface

#### FR-18: Responsive Design
**Priority:** High  
**Description:** The system shall be responsive and work on:
- Desktop (1920x1080 and above)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

**Rationale:** Users access the platform from various devices.

**Test Cases:**
- Layout adapts to screen size
- Touch interactions work on mobile
- Text is readable on all devices

#### FR-19: Toast Notifications
**Priority:** Medium  
**Description:** The system shall display toast notifications for:
- Success messages (card created, updated, deleted)
- Error messages (API failures, validation errors)
- Information messages

**Rationale:** Provides user feedback for actions.

**Test Cases:**
- Toasts appear on relevant actions
- Toasts auto-dismiss after timeout
- Multiple toasts stack correctly

#### FR-20: Loading States
**Priority:** Medium  
**Description:** The system shall display loading indicators when:
- Fetching flashcards
- Submitting forms
- Loading user data

**Rationale:** Improves perceived performance and user experience.

**Test Cases:**
- Loading indicators appear during async operations
- Indicators disappear when operations complete

#### FR-21: Error Handling
**Priority:** High  
**Description:** The system shall handle errors gracefully:
- Display user-friendly error messages
- Log errors for debugging
- Prevent application crashes

**Rationale:** Ensures stable user experience.

**Test Cases:**
- API errors are caught and displayed
- Network errors show appropriate messages
- Application continues to function after errors

---

### 2.6 API Requirements

#### FR-22: API Authentication
**Priority:** Critical  
**Description:** All API endpoints (except public ones) shall require valid Auth0 JWT token in Authorization header.

**Format:** `Authorization: Bearer <token>`

**Rationale:** Ensures data security and user isolation.

**Test Cases:**
- Requests without token are rejected (401)
- Invalid tokens are rejected (401)
- Valid tokens allow access

#### FR-23: CORS Configuration
**Priority:** High  
**Description:** The backend API shall support Cross-Origin Resource Sharing (CORS) for frontend requests.

**Rationale:** Enables frontend to make API requests from different origin.

**Test Cases:**
- Frontend can make API requests
- CORS headers are properly set
- Preflight requests are handled

#### FR-24: API Error Responses
**Priority:** High  
**Description:** API endpoints shall return appropriate HTTP status codes and error messages:
- 200: Success
- 400: Bad Request (missing/invalid parameters)
- 401: Unauthorized (authentication required)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

**Rationale:** Enables proper error handling in frontend.

**Test Cases:**
- Correct status codes are returned
- Error messages are descriptive
- Error format is consistent

---

## 3. NON-FUNCTIONAL REQUIREMENTS

### 3.1 Usability Requirements

#### NFR-1: User Interface Design
**Priority:** High  
**Description:** The system shall provide a modern, clean, and intuitive user interface using Tailwind CSS and shadcn/ui components.

**Rationale:** Good UI/UX increases user engagement and satisfaction.

**Success Criteria:**
- Consistent design language throughout application
- Intuitive navigation
- Clear visual hierarchy

#### NFR-2: Accessibility
**Priority:** Medium  
**Description:** The system shall follow WCAG 2.1 Level AA guidelines for accessibility.

**Rationale:** Ensures platform is usable by people with disabilities.

**Success Criteria:**
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast

#### NFR-3: Browser Compatibility
**Priority:** High  
**Description:** The system shall support modern web browsers:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Rationale:** Ensures broad user accessibility.

---

### 3.2 Performance Requirements

#### NFR-4: Page Load Time
**Priority:** High  
**Description:** Initial page load time shall be less than 3 seconds on 3G connection.

**Rationale:** Fast loading improves user experience and reduces bounce rate.

**Success Criteria:**
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse Performance Score > 80

#### NFR-5: API Response Time
**Priority:** High  
**Description:** API endpoints shall respond within 500ms for 95% of requests.

**Rationale:** Fast API responses ensure responsive user interface.

**Success Criteria:**
- Average response time < 300ms
- 95th percentile < 500ms
- Database queries optimized

#### NFR-6: Concurrent Users
**Priority:** Medium  
**Description:** The system shall support at least 100 concurrent users.

**Rationale:** Ensures platform scalability.

**Success Criteria:**
- System handles 100 concurrent users without degradation
- Response times remain within acceptable limits

---

### 3.3 Reliability Requirements

#### NFR-7: System Availability
**Priority:** High  
**Description:** The system shall be available 99.5% of the time (uptime).

**Rationale:** Users expect reliable access to their learning materials.

**Success Criteria:**
- Monthly uptime > 99.5%
- Planned maintenance windows < 4 hours/month
- Automatic recovery from failures

#### NFR-8: Data Persistence
**Priority:** Critical  
**Description:** User flashcards and progress data shall be persisted reliably in MongoDB.

**Rationale:** Data loss would severely impact user trust and experience.

**Success Criteria:**
- Data is saved immediately after user actions
- Database backups are performed regularly
- Data recovery procedures are in place

#### NFR-9: Error Recovery
**Priority:** High  
**Description:** The system shall recover gracefully from errors without data loss.

**Rationale:** Ensures system stability and user data integrity.

**Success Criteria:**
- Errors are logged for debugging
- User data is not corrupted
- System continues to function after non-critical errors

---

### 3.4 Security Requirements

#### NFR-10: Authentication Security
**Priority:** Critical  
**Description:** User authentication shall be handled securely using Auth0 with JWT tokens.

**Rationale:** Prevents unauthorized access to user accounts and data.

**Success Criteria:**
- Tokens are validated on every request
- Expired tokens are rejected
- Token secrets are not exposed

#### NFR-11: Data Isolation
**Priority:** Critical  
**Description:** User data shall be isolated - users can only access their own flashcards.

**Rationale:** Ensures privacy and prevents data breaches.

**Success Criteria:**
- User email is used to filter data
- No cross-user data access possible
- API validates user ownership

#### NFR-12: HTTPS Encryption
**Priority:** Critical  
**Description:** All communication between client and server shall use HTTPS with valid SSL certificates.

**Rationale:** Protects data in transit from interception.

**Success Criteria:**
- SSL certificates are valid and up-to-date
- HTTP requests redirect to HTTPS
- TLS 1.2+ is used

#### NFR-13: Input Validation
**Priority:** High  
**Description:** All user inputs shall be validated and sanitized to prevent injection attacks.

**Rationale:** Prevents security vulnerabilities.

**Success Criteria:**
- SQL/NoSQL injection attempts are blocked
- XSS attacks are prevented
- Input length limits are enforced

---

### 3.5 Maintainability Requirements

#### NFR-14: Code Quality
**Priority:** Medium  
**Description:** Code shall follow best practices and be well-documented.

**Rationale:** Facilitates maintenance and future development.

**Success Criteria:**
- Code follows ESLint/Flake8 standards
- Functions are documented
- README files are comprehensive

#### NFR-15: Modular Architecture
**Priority:** Medium  
**Description:** The system shall be built with modular components that can be updated independently.

**Rationale:** Enables easier maintenance and feature additions.

**Success Criteria:**
- Components are reusable
- Clear separation of concerns
- Low coupling between modules

---

### 3.6 Deployment Requirements

#### NFR-16: Docker Containerization
**Priority:** High  
**Description:** The system shall be deployable using Docker and Docker Compose.

**Rationale:** Ensures consistent deployment across environments.

**Success Criteria:**
- Docker images build successfully
- Containers start without errors
- Services communicate correctly

#### NFR-17: CI/CD Pipeline
**Priority:** High  
**Description:** The system shall have automated deployment via GitHub Actions.

**Rationale:** Enables rapid and reliable deployments.

**Success Criteria:**
- Push to main/master triggers deployment
- Docker containers are rebuilt
- Services are restarted automatically
- Deployment logs are available

#### NFR-18: Environment Configuration
**Priority:** High  
**Description:** The system shall support different configurations for development, staging, and production.

**Rationale:** Enables safe testing and deployment.

**Success Criteria:**
- Environment variables are used for configuration
- Secrets are not committed to repository
- Different environments can be configured independently

---

## 4. PROJECT CONSTRAINTS

### 4.1 Technical Constraints

1. **Frontend Framework:** Must use React 18.2
2. **Build Tool:** Must use Vite 5.4
3. **Styling:** Must use Tailwind CSS 3.4
4. **Backend Framework:** Must use Flask 2.2.2
5. **Database:** Must use MongoDB 7.0
6. **Authentication:** Must use Auth0
7. **Deployment:** Must use Docker and Docker Compose

### 4.2 Business Constraints

1. **Budget:** No specific budget constraints mentioned
2. **Timeline:** No specific deadline mentioned
3. **Resources:** Development team available

### 4.3 Regulatory Constraints

1. **Data Privacy:** Must comply with GDPR if serving EU users
2. **Accessibility:** Should comply with WCAG 2.1 Level AA

---

## 5. PROJECT ISSUES

### 5.1 Open Issues

None currently identified.

### 5.2 Off-the-Shelf Solutions

1. **Auth0:** Used for authentication (third-party service)
2. **MongoDB:** Used for data storage (third-party database)
3. **shadcn/ui:** Used for UI components (open-source library)
4. **Lucide React:** Used for icons (open-source library)

### 5.3 New Problems

None currently identified.

### 5.4 Tasks

1. ✅ Migrate from Create React App to Vite
2. ✅ Implement Tailwind CSS and shadcn/ui
3. ✅ Integrate Auth0 authentication
4. ✅ Implement flashcard CRUD operations
5. ✅ Implement review state management
6. ✅ Implement progress tracking
7. ✅ Set up Docker deployment
8. ✅ Configure CI/CD pipeline
9. ✅ Set up Nginx reverse proxy
10. ✅ Implement responsive design

---

## 6. RISKS

### 6.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| MongoDB connection failure | High | Low | Implement connection retry logic, use connection pooling |
| Auth0 service outage | High | Low | Monitor Auth0 status, have fallback authentication plan |
| Docker deployment issues | Medium | Medium | Test deployments in staging, maintain deployment documentation |
| Performance degradation with large datasets | Medium | Medium | Implement pagination, optimize database queries |

### 6.2 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low user adoption | High | Medium | Focus on UX, gather user feedback, iterate on features |
| Data loss | Critical | Low | Regular backups, test restore procedures |

---

## 7. GLOSSARY

- **Auth0**: Third-party authentication and authorization service
- **CORS**: Cross-Origin Resource Sharing - mechanism for allowing web pages to make requests to different domains
- **Docker**: Containerization platform for deploying applications
- **Docker Compose**: Tool for defining and running multi-container Docker applications
- **JWT**: JSON Web Token - a compact, URL-safe token format for authentication
- **MongoDB**: NoSQL document database
- **Nginx**: Web server and reverse proxy
- **shadcn/ui**: Collection of reusable React components
- **SPA**: Single Page Application - web application that loads a single HTML page
- **SSL/TLS**: Cryptographic protocols for secure communication
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server

---

## 8. APPENDICES

### 8.1 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/words` | Get all flashcards for all users | No |
| GET | `/api/words/rand/<email>` | Get random flashcard for user | No |
| POST | `/api/sendwords` | Create new flashcard | No |
| POST | `/api/editword` | Edit existing flashcard | No |
| DELETE | `/api/delword/<word>` | Delete flashcard | No |
| POST | `/api/token` | Validate JWT token | Yes |

### 8.2 Database Schema

**Collection:** `flashcards`

**Document Structure:**
```json
{
  "_id": ObjectId,
  "user_email": "user@example.com",
  "cards": {
    "term1": "definition1",
    "term2": "definition2FFFLASHBACKCARDS"
  },
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### 8.3 Environment Variables

**Frontend:**
- `VITE_BYPASS_AUTH`: Enable/disable Auth0 bypass in development
- `VITE_API_BASE_URL`: Backend API base URL

**Backend:**
- `MONGO_HOST`: MongoDB host address
- `MONGO_PORT`: MongoDB port
- `MONGO_DATABASE`: Database name
- `MONGO_USERNAME`: MongoDB username (optional)
- `MONGO_PASSWORD`: MongoDB password (optional)
- `PORT`: Flask server port

### 8.4 Technology Stack

**Frontend:**
- React 18.2
- Vite 5.4
- Tailwind CSS 3.4
- shadcn/ui components
- React Router DOM 6.3
- Auth0 React SDK 1.11.0
- Lucide React (icons)

**Backend:**
- Flask 2.2.2
- Python 3.9+
- PyMongo 4.6.1
- python-jose 3.3.0 (JWT handling)
- Flask-CORS 3.0.10

**Infrastructure:**
- Docker & Docker Compose
- Nginx (reverse proxy)
- MongoDB 7.0
- GitHub Actions (CI/CD)

---

**Document End**

