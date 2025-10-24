# 🏡 Real Estate Property Management Platform
### Built on Salesforce Platform with Experience Cloud

[![Salesforce](https://img.shields.io/badge/Salesforce-00A1E0?style=for-the-badge&logo=salesforce&logoColor=white)](https://www.salesforce.com/)
[![Lightning Web Components](https://img.shields.io/badge/LWC-0176D3?style=for-the-badge&logo=salesforce&logoColor=white)](https://developer.salesforce.com/docs/component-library/documentation/en/lwc)
[![Apex](https://img.shields.io/badge/Apex-00A1E0?style=for-the-badge&logo=salesforce&logoColor=white)](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/)

A comprehensive, enterprise-grade **Real Estate Property Management System** built on Salesforce Platform, featuring a modern Experience Cloud buyer portal, complete property lifecycle management, and integrated e-commerce capabilities.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Custom Objects](#-custom-objects)
- [LWC Components](#-lwc-components)
- [Apex Controllers](#-apex-controllers)

---

## 🎯 Project Overview

This platform provides a **complete real estate ecosystem** connecting buyers, sellers, and agents through a modern, intuitive interface. The system manages the entire property lifecycle from listing to closing, with integrated appointment scheduling, offer management, and e-commerce functionality.

### Business Value

- **For Property Managers**: Centralized property portfolio management with automated workflows
- **For Buyers**: Self-service portal for property browsing, appointments, and offer submissions
- **For Agents**: Streamlined lead management and commission tracking
- **For Leadership**: Real-time analytics and reporting on property performance

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SALESFORCE PLATFORM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     EXPERIENCE CLOUD SITE                              │  │
│  │                    (Buyer Self-Service Portal)                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                          │
│                                    │                                          │
│  ┌────────────────────────────────┴───────────────────────────────────┐     │
│  │               LIGHTNING WEB COMPONENTS LAYER (31 Components)        │     │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  • Property Browsing   • Shopping Cart      • My Dashboard          │    │
│  │  • Property Details    • Checkout           • My Appointments       │    │
│  │  • Image Carousel      • Wishlist           • My Inquiries          │    │
│  │  • Property Filters    • Offer Modal        • My Offers             │    │
│  │  • Property Calculator • Schedule Modal     • My Properties         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                          │
│                                    │                                          │
│  ┌────────────────────────────────┴───────────────────────────────────┐     │
│  │                   APEX BUSINESS LOGIC LAYER                         │     │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  Controllers:                    Services:                          │    │
│  │  • PropertyController            • Authentication (Google, LinkedIn)│    │
│  │  • CartController                • Permission Assignment            │    │
│  │  • WishlistController            • Order Processing                │    │
│  │  • BuyerDashboardController      • Payment Integration             │    │
│  │  • MyOffersController            • Email Notifications             │    │
│  │  • CheckoutController                                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                          │
│                                    │                                          │
│  ┌────────────────────────────────┴───────────────────────────────────┐     │
│  │                     DATA MODEL LAYER (50+ Objects)                  │     │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  Core Entities:                  Related Entities:                  │    │
│  │  • Property__c                   • PropertyInquiry__c              │    │
│  │  • Property_Listing__c           • Appointment__c                  │    │
│  │  • Offer__c                      • Wishlist__c                     │    │
│  │  • Agent__c                      • Cart__c                         │    │
│  │  • LocationSite__c               • Commission__c                   │    │
│  │  • Property_Image__c             • Invoice__c                      │    │
│  │  • Property_Feature__c           • PropertyDocument__c             │    │
│  │  • Property_Amenities__c         • Loan_Application__c             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                          │
│                                    │                                          │
│  ┌────────────────────────────────┴───────────────────────────────────┐     │
│  │                   AUTOMATION & INTEGRATION                          │     │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  • Process Builder & Flows       • REST API Integration            │    │
│  │  • Approval Processes             • OAuth Authentication           │    │
│  │  • Validation Rules               • Payment Gateway (Stripe)       │    │
│  │  • Email Alerts & Templates       • Document Storage (DropBox)     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼────────┐            ┌────────▼────────┐
            │  External APIs  │            │  Third-Party    │
            │  • Stripe       │            │  Services       │
            │  • Google OAuth │            │  • DropBox      │
            │  • LinkedIn     │            │  • Email        │
            └─────────────────┘            └─────────────────┘
```

### Application Flow

```
┌─────────────┐
│   Buyer     │
│  (Guest)    │
└──────┬──────┘
       │
       │ 1. Browse Properties
       ▼
┌─────────────────────────┐
│  Property Listing Page  │
│  • Search & Filter      │
│  • Property Cards       │
│  • Add to Cart/Wishlist │
└──────┬──────────────────┘
       │
       │ 2. View Details
       ▼
┌─────────────────────────┐
│ Property Details Page   │
│  • Images & Features    │
│  • Calculator           │
│  • Submit Inquiry       │
│  • Schedule Viewing     │
│  • Make Offer ───────┐  │
└──────┬────────────────┘  │
       │                   │
       │                   │ Login Check
       │                   │
       ▼                   ▼
┌─────────────────┐  ┌──────────────┐
│  Add to Cart    │  │ Login Page   │
└──────┬──────────┘  └──────┬───────┘
       │                     │
       │ 3. Checkout         │ 4. Authenticated
       ▼                     ▼
┌─────────────────┐  ┌──────────────────────┐
│ Checkout Page   │  │  Buyer Dashboard     │
│  • Review Items │  │  • My Appointments   │
│  • Payment      │  │  • My Inquiries      │
│  • Place Order  │  │  • My Offers         │
└──────┬──────────┘  │  • My Properties     │
       │             │  • Order History     │
       │             └──────────────────────┘
       ▼
┌─────────────────┐
│  Order Success  │
│  • Confirmation │
│  • Invoice      │
└─────────────────┘
```

---

## Key Features

### 1. Property Management

#### Property Listings
- **Multi-criteria Search**: Filter by price, location, type, bedrooms, bathrooms
- **Advanced Filtering**: Size, amenities, features, and custom criteria
- **Property Types**: Residential, Commercial, Land, Multi-family
- **Rich Media**: Multiple images with carousel viewer
- **Detailed Information**: Specifications, features, amenities, location

#### Property Details
- **Image Carousel**: Swipeable image gallery with indicators
- **Property Calculator**: Mortgage payment calculator with tax/insurance
- **Document Library**: Brochures, floor plans, disclosures
- **Location Integration**: Interactive maps and neighborhood info
- **Agent Information**: Contact details and agent profile

### 2. 🛒 E-Commerce Functionality

#### Shopping Cart
- Add multiple properties to cart
- Quantity management (for bulk purchases/investment properties)
- Real-time cart summary with totals
- Persistent cart across sessions
- Remove items functionality

#### Checkout Process
- Review cart items before purchase
- Integrated payment processing (Stripe)
- Order confirmation and invoice generation
- Order history tracking
- Email notifications

#### Wishlist Management
- Create multiple wishlists
- Save favorite properties
- Share wishlists
- Add notes to saved properties
- Quick add to cart from wishlist

### 3. Offer Management System

#### Make Offer (Login Required)
- **Offer Creation Modal**: Comprehensive offer submission form
  - Offered Purchase Price (required)
  - Deposit Amount
  - Offer Date (defaults to today)
  - Offer Expiration Date
  - Proposed Closing Date
  - Financing Contingency option
  - Inspection Contingency option
  - Special Terms & Conditions
- **Automatic Status**: All offers created as "Draft"
- **Buyer Association**: Linked to logged-in user's account

#### My Offers Dashboard
- **View All Offers**: Complete history of submitted offers
- **Offer Details Display**:
  - Property information with image
  - Your offer price vs listing price
  - Counter offer amount (if available)
  - Message from seller
  - Offer dates and deadlines
  - Deposit amount
  - Contingencies included
  - Special terms
- **Status Tracking**:
  - Draft
  - Pending
  - Under Review
  - Accepted
  - Rejected
  - Withdrawn
- **Statistics Dashboard**:
  - Total offers count
  - Offers by status
  - Quick filters
- **Property Navigation**: Direct link to property details from offer card

### 4. Appointment Scheduling

#### Schedule Viewing
- **Interactive Calendar**: Select available date/time slots
- **Appointment Types**:
  - In-Person Viewing
  - Virtual Tour
  - Open House
- **Appointment Management**:
  - Duration selection (15, 30, 45, 60 minutes)
  - Purpose/notes field
  - Agent assignment
- **Confirmation System**: Email confirmations and reminders

#### My Appointments
- View all scheduled appointments
- Filter by status (Scheduled, Confirmed, Completed, Cancelled)
- Appointment details with property information
- Quick navigation to property
- Upcoming appointments highlighted

### 5. Inquiry System

#### Submit Inquiry Modal (Reusable)
- Contact form for property questions
- Used for both "Submit Inquiry" and "Contact Agent" actions
- Fields:
  - Name (pre-filled if logged in)
  - Email (pre-filled if logged in)
  - Phone (optional)
  - Message (required)
- Creates PropertyInquiry__c record
- Email notification to agent

#### My Inquiries Dashboard
- View all submitted inquiries
- Filter by status
- Property-inquiry relationship
- Response tracking
- Inquiry history

### 6. Buyer Dashboard

#### My Profile
- Personal information management
- Address details
- Contact preferences
- Account settings

#### My Properties
- Owned/purchased properties
- Property documents
- Transaction history
- Related appointments and inquiries

#### My Appointments
- Comprehensive appointment list
- Status filtering (Scheduled, Confirmed, Completed, Cancelled)
- Property details with images
- DateTime and duration display
- Quick property navigation

#### My Inquiries
- All inquiry submissions
- Status tracking
- Agent responses
- Property context

### 7. Authentication & Authorization

#### Social Authentication
- **Google OAuth**: Sign in with Google
- **LinkedIn OAuth**: Professional network integration
- **Permission Sets**: Auto-assigned on registration
- **User Profiles**: Buyer, Agent, Property Manager roles

#### Guest Access
- Browse properties without login
- View property details
- Use calculator
- Limited cart functionality
- Must login for:
  - Making offers
  - Scheduling appointments
  - Submitting inquiries
  - Checkout

### 8. Agent & Commission Tracking

- Agent specialization management
- Commission calculation rules
- Territory assignment
- Performance metrics
- Lead tracking

### 9. Document Management

- Property documents storage
- Document categories (Brochure, Floor Plan, Disclosure, Inspection)
- DropBox integration for file storage
- Document access control
- Version management

---

## Technology Stack

### Frontend
- **Lightning Web Components (LWC)**: 31 custom components
- **Lightning Design System (SLDS)**: Consistent UI/UX
- **JavaScript ES6+**: Modern JavaScript features
- **CSS3**: Custom styling with responsive design
- **HTML5**: Semantic markup

### Backend
- **Apex**: 13 controllers and service classes
- **Salesforce Database**: Custom objects and relationships
- **SOQL**: Optimized queries with proper indexing
- **Triggers**: Event-driven automation (with framework)

### Platform Features
- **Experience Cloud**: Self-service buyer portal
- **Process Builder & Flows**: Business process automation
- **Approval Processes**: Offer and document approvals
- **Email Templates**: Professional communications
- **Validation Rules**: Data quality enforcement
- **Custom Metadata Types**: Configuration management

### Integrations
- **Google OAuth 2.0**: Authentication
- **LinkedIn OAuth**: Professional authentication
- **Stripe API**: Payment processing
- **DropBox API**: Document storage
- **REST APIs**: External system integration

---

## Custom Objects

### Core Property Objects
| Object | API Name | Description |
|--------|----------|-------------|
| Property | `Property__c` | Main property records |
| Property Listing | `Property_Listing__c` | Active listings with pricing |
| Property Image | `Property_Image__c` | Property photos and media |
| Property Feature | `Property_Feature__c` | Property-specific features |
| Property Amenities | `Property_Amenities__c` | Amenities junction object |
| Property Document | `PropertyDocument__c` | Related documents |
| Location Site | `LocationSite__c` | Property locations |
| Amenities | `Amenities__c` | Master amenities list |
| Feature | `Feature__c` | Master features list |

### Transaction Objects
| Object | API Name | Description |
|--------|----------|-------------|
| Offer | `Offer__c` | Property offers with counter-offers |
| Cart | `Cart__c` | Shopping cart for properties |
| Invoice | `Invoice__c` | Order invoices |
| Purchase Order | `Purchase_Order__c` | Purchase orders |
| Purchase Order Line | `Purchase_Order_Line__c` | Order line items |
| Stripe Payment Transaction | `StripePaymentTransaction__c` | Payment records |
| Commission | `Commission__c` | Agent commissions |

### Customer Relationship Objects
| Object | API Name | Description |
|--------|----------|-------------|
| Property Inquiry | `PropertyInquiry__c` | Customer inquiries |
| Appointment | `Appointment__c` | Property viewings |
| Wishlist | `Wishlist__c` | Saved properties |
| Newsletter Subscription | `Newsletter_Subscription__c` | Email subscriptions |
| Loan Application | `Loan_Application__c` | Financing applications |

### Agent & Organization Objects
| Object | API Name | Description |
|--------|----------|-------------|
| Agent | `Agent__c` | Real estate agents |
| Agent Specialisation | `Agent_Specialisation__c` | Agent expertise |
| Specialisation | `Specialisation__c` | Specialization types |
| Territory | `Territory__c` | Sales territories |
| Employee | `Employee__c` | Staff records |

### Configuration Objects
| Object | API Name | Description |
|--------|----------|-------------|
| Org Settings | `OrgSettings__c` | Organization configuration |
| Org Configuration | `OrgConfiguration__c` | Advanced settings |
| System Log | `SystemLog__c` | Application logging |
| Application Log | `Application_Log__c` | Error tracking |
| Tax Rate (MDT) | `Tax_Rate__mdt` | Tax calculation metadata |

---

## LWC Components

### Property Browsing & Display (10 Components)
| Component | Description | Key Features |
|-----------|-------------|--------------|
| `propertyContainer` | Main listing container | Search, filter, pagination |
| `propertyCard` | Individual property card | Quick view, actions |
| `propertyFilters` | Advanced filter panel | Multi-criteria filtering |
| `propertyDetailsPage` | Complete property view | All property info, actions |
| `imageCarousel` | Image slider | Swipe, indicators, thumbnails |
| `propertyOverview` | Property summary | Key specs, pricing |
| `propertyCalculator` | Mortgage calculator | Payment estimation |
| `propertyDocumentList` | Document browser | Download, preview |
| `homePageHero` | Landing page hero | Featured properties |
| `propertyDetailsStyles` | Shared styles | Consistent theming |

### Shopping & Checkout (3 Components)
| Component | Description | Key Features |
|-----------|-------------|--------------|
| `cartDisplay` | Shopping cart view | Add/remove, totals |
| `cartDetailsPage` | Full cart page | Review, edit items |
| `checkout` | Checkout process | Payment, confirmation |

### Wishlist (2 Components)
| Component | Description | Key Features |
|-----------|-------------|--------------|
| `wishlistDisplay` | Wishlist viewer | Multiple lists, sharing |
| `wishlistNameModal` | Create wishlist modal | Name, description |

### Buyer Dashboard (7 Components)
| Component | Description | Key Features |
|-----------|-------------|--------------|
| `buyerDashboard` | Main dashboard | Stats, quick actions |
| `myProfile` | Profile management | Edit info, preferences |
| `myAppointments` | Appointment list | Filter, status tracking |
| `myInquiries` | Inquiry history | View responses |
| `myOffers` | Offer management | View offers, counter-offers, messages |
| `myProperties` | Owned properties | Documents, history |
| `orderList` | Order history | Past purchases |
| `orderDetail` | Order details | Invoice, items |

### Modals & Interactions (5 Components)
| Component | Description | Key Features |
|-----------|-------------|--------------|
| `makeOfferModal` | Submit offer form | Comprehensive offer details |
| `submitInquiryModal` | Contact form | Reusable for inquiries |
| `scheduleViewingModal` | Book appointment | Calendar, time selection |
| `stickyHeader` | Fixed navigation | Search, cart icon |

### Utilities & Shared (4 Components)
| Component | Description | Key Features |
|-----------|-------------|--------------|
| `personalInfoDisplay` | User info card | Name, contact, address |
| `addressDisplay` | Address formatter | Standardized display |
| `calculationUtils` | Math helpers | Tax, payment calculations |
| `simpleStyles` | Base styles | Common CSS |
| `propertyCardStyles` | Card styles | Consistent card UI |

---

## Apex Controllers

| Controller | Methods | Purpose |
|------------|---------|---------|
| `PropertyController` | 15+ methods | Main property operations, offers, appointments |
| `CartController` | 8 methods | Cart CRUD, checkout |
| `WishlistController` | 6 methods | Wishlist management |
| `BuyerDashboardController` | 10 methods | Dashboard data aggregation |
| `MyProfileController` | 5 methods | Profile management |
| `MyPropertiesController` | 4 methods | Property ownership |
| `CheckoutController` | 6 methods | Order processing |
| `OrderDetailController` | 3 methods | Order retrieval |
| `PropertyOverviewController` | 5 methods | Property search |
| `HomePageController` | 4 methods | Featured properties |
| `GoogleAuthHandler` | 2 methods | Google OAuth |
| `LinkedInAuthHandler` | 2 methods | LinkedIn OAuth |
| `PermissionSetAssignmentQueueable` | 1 method | Async permission assignment |

---

## Screenshots

### Property Listing Page
```
┌────────────────────────────────────────────────────────┐
│  [Search Bar]  [Filters]                    [Cart: 3] │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Image   │  │  Image   │  │  Image   │            │
│  │          │  │          │  │          │            │
│  ├──────────┤  ├──────────┤  ├──────────┤            │
│  │ $500K    │  │ $750K    │  │ $1.2M    │            │
│  │ 3BR 2BA  │  │ 4BR 3BA  │  │ 5BR 4BA  │            │
│  │ [Cart]   │  │ [Cart]   │  │ [Cart]   │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Property Details Page
```
┌────────────────────────────────────────────────────────┐
│  [< Back]                            [Cart] [Wishlist] │
├────────────────────────────────────────────────────────┤
│  [======== Image Carousel ========]                    │
│  [  < Prev ]  [ 1 2 3 4 5 ]  [ Next > ]               │
├────────────────────────────────────────────────────────┤
│  Modern Family Home - $850,000                         │
│  123 Main St, San Francisco, CA                        │
│                                                         │
│  4 Beds  |  3 Baths  |  2,500 sqft  |  Built: 2020   │
├────────────────────────────────────────────────────────┤
│  [Make Offer] [Schedule Viewing] [Contact Agent]      │
│                                                         │
│  Mortgage Calculator                                    │
│  ┌────────────────────────────────────────┐           │
│  │ Monthly Payment: $4,200                │           │
│  └────────────────────────────────────────┘           │
└────────────────────────────────────────────────────────┘
```

### My Offers Dashboard
```
┌────────────────────────────────────────────────────────┐
│  My Offers                                              │
├────────────────────────────────────────────────────────┤
│  [5 Total] [1 Draft] [2 Pending] [1 Accepted]         │
│                                                         │
│  Filter: [All ▼]                                       │
├────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐   │
│  │ [Image] Property Name                  [Draft] │   │
│  │         123 Main St, SF                        │   │
│  │                                                 │   │
│  │  Your Offer: $850,000                          │   │
│  │  Counter Offer: $875,000                       │   │
│  │                                                 │   │
│  │  📧 MESSAGE FROM SELLER:                       │   │
│  │  "Thank you for your offer. We are willing..." │   │
│  │                                                 │   │
│  │  Offer Date: Jan 15, 2025                      │   │
│  │  Expires: Jan 22, 2025                         │   │
│  │                                                 │   │
│  │  Contingencies: [Financing] [Inspection]       │   │
│  │                                                 │   │
│  │  [View Property]                               │   │
│  └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### Step 4: Configure Experience Cloud Site

1. **Create Experience Site**:
   - Setup → Digital Experiences → All Sites → New
   - Select "Build Your Own (LWR)" template
   - Name: "Property Buyer Portal"

2. **Add Components to Pages**:
   - Home Page: `homePageHero`, `propertyContainer`
   - Property Details: `propertyDetailsPage`
   - My Dashboard: `buyerDashboard`, tabs for appointments/inquiries/offers
   - Checkout: `checkout`

3. **Configure Navigation**:
   - Home
   - Properties
   - My Dashboard
   - Cart
   - Login/Register

4. **Set Up Guest User Profile**:
   - Grant read access to Property__c, Property_Listing__c, Property_Image__c
   - Grant create access to Cart__c, Wishlist__c (for anonymous users)

5. **Configure Authentication**:
   - Enable self-registration
   - Set up Google OAuth provider
   - Set up LinkedIn OAuth provider
   - Configure permission set auto-assignment

### Step 5: Load Sample Data (Optional)
```bash
# Import sample properties

```

### Step 6: Activate and Test

1. **Activate Site**: Experience Builder → Publish
2. **Test Guest Access**: Browse properties, add to cart
3. **Test Authenticated Flow**: Register → Make offer → View dashboard
4. **Verify Integrations**: OAuth login

**Built with ❤️ on the Salesforce Platform**
