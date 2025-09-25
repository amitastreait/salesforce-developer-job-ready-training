# Salesforce Developer Training

A comprehensive Salesforce DX project showcasing Lightning Web Components (LWC) development patterns, Apex programming, and Salesforce platform capabilities.

## 📋 Project Overview

This project serves as a complete training repository for Salesforce developers, covering:

- **Lightning Web Components (LWC)** - Modern web standards-based UI framework
- **Apex Development** - Server-side programming with comprehensive examples
- **Salesforce Platform Features** - Flows, triggers, custom objects, and more
- **Enterprise Architecture** - Best practices for scalable applications

## 🚀 Features

### Lightning Web Components
- **4 Custom LWC Components** with comprehensive examples
- **Component Styling** - CSS techniques and SLDS integration
- **Event Handling** - Browser events, custom events, and user interactions
- **Data Binding** - Property management and reactive programming
- **Component Composition** - Slots and advanced patterns
- **Responsive Layouts** - Lightning Layout components

### Apex Development
- **50+ Apex Classes** covering various patterns and use cases
- **Trigger Framework** - Centralized trigger management
- **Test Classes** - Comprehensive test coverage examples
- **Batch Processing** - Asynchronous processing patterns
- **Integration Services** - HTTP callouts and external system integration
- **Exception Handling** - Custom exceptions and error management

### Salesforce Platform Features
- **Custom Objects** - 15+ custom objects modeling real-world scenarios
- **Flows** - 30+ Screen Flows and Auto-launched Flows
- **Email Templates** - Professional email communication templates
- **Approval Processes** - Business process automation
- **Validation Rules** - Data quality enforcement
- **Page Layouts** - Optimized user interface designs

### Property Management Application
The project includes a complete **Property Management** application featuring:
- Property listings and management
- Agent specialization tracking
- Appointment scheduling
- Commission calculations
- Document management
- Approval workflows

## 📂 Project Structure

```
├── force-app/main/default/
│   ├── lwc/                    # Lightning Web Components
│   │   ├── helloWorld/         # Basic LWC example
│   │   ├── createContact/      # Contact creation component
│   │   ├── recallApproval/     # Approval recall functionality
│   │   └── ligthingLayout/     # Responsive layout examples
│   ├── classes/                # Apex Classes
│   │   ├── triggers/           # Trigger handlers
│   │   ├── services/           # Service layer classes
│   │   ├── batch/             # Batch processing
│   │   └── tests/             # Test classes
│   ├── objects/               # Custom Objects
│   ├── flows/                 # Screen & Auto-launched Flows
│   ├── triggers/              # Apex Triggers
│   ├── layouts/               # Page Layouts
│   ├── email/                 # Email Templates
│   └── flexipages/            # Lightning Pages
├── docs/                      # Documentation
│   ├── Study_Guide.md         # Comprehensive LWC guide
│   ├── AGENDA.md             # Training agenda
│   └── FLEX_TEMPLATES.md     # Flex page templates
├── scripts/                   # Utility scripts
└── config/                    # Scratch org configuration
```

## 🎯 Learning Objectives

### For Beginners
- Understanding Salesforce DX project structure
- Basic Lightning Web Component development
- Apex programming fundamentals
- Salesforce platform navigation

### For Intermediate Developers
- Advanced LWC patterns (slots, composition, events)
- Apex best practices and design patterns
- Integration patterns and testing strategies
- Flow automation and business processes

### For Advanced Developers
- Enterprise architecture patterns
- Performance optimization techniques
- Complex business logic implementation
- Platform governance and scaling

## 🛠️ Development Setup

### Prerequisites
- Salesforce CLI installed
- VS Code with Salesforce Extension Pack
- Git for version control
- Node.js (for LWC testing)

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/salesforce-developer-training.git
   cd salesforce-developer-training
   ```

2. **Create a scratch org:**
   ```bash
   sfdx force:org:create -f config/project-scratch-def.json -a DevTraining -d 7
   ```

3. **Push source to scratch org:**
   ```bash
   sfdx force:source:push
   ```

4. **Open the scratch org:**
   ```bash
   sfdx force:org:open
   ```

### Testing

Run unit tests for Lightning Web Components:
```bash
npm test
```

Run Apex tests:
```bash
sfdx force:apex:test:run
```

## 📚 Training Materials

- **[Complete LWC Study Guide](docs/Study_Guide.md)** - Comprehensive guide covering all LWC concepts
- **[Training Agenda](docs/AGENDA.md)** - Structured learning path
- **Code Examples** - Real-world implementation patterns

## 🔧 Development Tools

- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Jest** - JavaScript testing framework
- **Husky** - Git hooks for quality gates

## 📈 Recent Updates

- ✅ Input handling and browser events in LWC
- ✅ Conditional rendering and loops
- ✅ Component styling techniques
- ✅ Responsive UI with Lightning Layouts

## 🤝 Contributing

This is a training project designed for learning. Feel free to:
- Extend existing components
- Add new examples
- Improve documentation
- Submit issues for clarification

## 📄 License

This project is for educational purposes. Use the patterns and examples to build your Salesforce development skills.

## 📞 Support

For questions about Salesforce development concepts covered in this project, refer to:
- [Salesforce Developer Documentation](https://developer.salesforce.com/)
- [Lightning Web Components Dev Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc)
- [Apex Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/)
