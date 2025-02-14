const surveyData = {
    "General Understanding of Program Architecture": [
    {
      question: "How familiar are you with program architecture concepts?",
      options: ["Beginner", "Intermediate", "Advanced"],
    },
    {
      question: "Which architectural style do you primarily work with?",
      options: ["Monolithic", "Microservices", "Event-driven", "Layered", "Other"],
    },
    {
      question: "How important is program architecture in software development?",
      options: [
        "Extremely important",
        "Moderately important",
        "Slightly important",
        "Not important",
      ],
    },
    {
      question: "How often do you consider scalability when designing architecture?",
      options: ["Always", "Often", "Sometimes", "Rarely"],
    },
    {
      question: "What is your primary goal when designing software architecture?",
      options: [
        "Performance optimization",
        "Scalability",
        "Maintainability",
        "Security",
        "Cost reduction",
      ],
    },
  ],

  "Architectural Styles & Patterns": [
    {
      question: "Which architectural pattern do you most commonly use?",
      options: [
        "Model-View-Controller (MVC)",
        "Microservices",
        "Event-driven architecture",
        "Layered architecture",
        "Other",
      ],
    },
    {
      question: "Do you prefer a monolithic or microservices-based approach?",
      options: ["Monolithic", "Microservices", "Hybrid", "Not sure"],
    },
    {
      question: "Have you worked with serverless architecture?",
      options: ["Yes", "No", "Planning to"],
    },
    {
      question: "Do you use event-driven architecture in your projects?",
      options: ["Yes, frequently", "Occasionally", "No"],
    },
    {
      question: "How do you handle inter-service communication in distributed systems?",
      options: ["REST APIs", "GraphQL", "gRPC", "Message Queues (Kafka, RabbitMQ, etc.)"],
    },
  ],
  "Software Design Principles": [
    {
      question: "Do you follow SOLID principles in your architecture?",
      options: ["Yes, strictly", "Somewhat", "No"],
    },
    {
      question: "How do you ensure separation of concerns in your applications?",
      options: [
        "Using layers (e.g., UI, business logic, database)",
        "Using microservices",
        "Using domain-driven design",
        "I don’t focus on it",
      ],
    },
    {
      question: "Which principle do you prioritize the most?",
      options: ["DRY (Don’t Repeat Yourself)", "KISS (Keep It Simple, Stupid)", "YAGNI (You Ain’t Gonna Need It)", "None"],
    },
    {
      question: "How do you manage dependency injection in your architecture?",
      options: ["Using frameworks (Spring, NestJS, etc.)", "Manually through constructors", "Not using dependency injection"],
    },
    {
      question: "How do you handle code maintainability?",
      options: [
        "Writing modular code",
        "Following clean code principles",
        "Documenting code thoroughly",
        "Regular code reviews",
      ],
    },
  ],

  "Performance & Scalability": [
    {
      question: "What is the most critical factor in application performance?",
      options: ["Database optimization", "Caching strategies", "Efficient algorithms", "Load balancing"],
    },
    {
      question: "How do you handle high traffic loads?",
      options: ["Load balancing", "Horizontal scaling", "Vertical scaling", "Caching"],
    },
    {
      question: "Do you use caching mechanisms in your architecture?",
      options: ["Yes, extensively", "Occasionally", "No"],
    },
    {
      question: "How do you ensure efficient database performance?",
      options: ["Indexing", "Query optimization", "Caching", "All of the above"],
    },
    {
      question: "How do you handle failure and fault tolerance?",
      options: ["Redundancy", "Circuit breaker pattern", "Graceful degradation", "Not considered"],
    },
  ],
  "Security Considerations": [
    {
      question: "How often do you perform security audits?",
      options: ["Regularly", "Occasionally", "Rarely", "Never"],
    },
    {
      question: "What is the most common security measure you implement?",
      options: ["Authentication & authorization", "Encryption", "Secure APIs", "Firewalls"],
    },
    {
      question: "How do you manage user authentication?",
      options: ["OAuth", "JWT", "Session-based authentication", "Other"],
    },
    {
      question: "Do you follow the principle of least privilege in access control?",
      options: ["Yes", "No"],
    },
    {
      question: "How do you protect against SQL injection?",
      options: ["Parameterized queries", "ORM", "Input validation", "Not a concern"],
    },
  ],

  "API Design & Integration": [
    {
      question: "What type of API do you primarily work with?",
      options: ["REST", "GraphQL", "gRPC", "WebSockets"],
    },
    {
      question: "How do you document your APIs?",
      options: ["OpenAPI (Swagger)", "Postman", "Internal documentation", "No documentation"],
    },
    {
      question: "Do you implement rate limiting in your APIs?",
      options: ["Yes", "No"],
    },
    {
      question: "How do you ensure API versioning?",
      options: ["URL versioning", "Header versioning", "No versioning"],
    },
    {
      question: "Do you use API gateways in your architecture?",
      options: ["Yes", "No"],
    },
  ],
  "Testing & Debugging": [
    {
      question: "What types of testing do you use?",
      options: ["Unit testing", "Integration testing", "Load testing", "End-to-end testing"],
    },
    {
      question: "Which testing framework do you prefer?",
      options: ["Jest", "Mocha", "JUnit", "Other"],
    },
    {
      question: "Do you use automated testing?",
      options: ["Yes, extensively", "Occasionally", "No"],
    },
    {
      question: "How do you handle logging and debugging?",
      options: ["Logging frameworks", "Centralized logging system", "Manual debugging"],
    },
    {
      question: "How do you monitor application errors?",
      options: ["Using monitoring tools (Datadog, New Relic)", "Logging services", "Manual observation"],
    },
  ],

  "DevOps & Deployment": [
    {
      question: "How do you deploy applications?",
      options: ["CI/CD pipelines", "Manual deployment", "Docker containers"],
    },
    {
      question: "What containerization technology do you use?",
      options: ["Docker", "Kubernetes", "Not using containers"],
    },
    {
      question: "Do you use Infrastructure as Code (IaC)?",
      options: ["Yes (Terraform, AWS CloudFormation)", "No"],
    },
    {
      question: "What is your preferred cloud provider?",
      options: ["AWS", "Azure", "Google Cloud", "Other"],
    },
    {
      question: "How often do you update your architecture?",
      options: ["Regularly", "Occasionally", "Rarely"],
    },
  ],
  "Emerging Trends & Technologies": [
    {
      question: "Have you worked with edge computing?",
      options: ["Yes", "No"],
    },
    {
      question: "Do you integrate AI/ML models into your architecture?",
      options: ["Yes", "No"],
    },
    {
      question: "Are you considering blockchain-based architecture?",
      options: ["Yes", "No"],
    },
    {
      question: "Have you explored Quantum computing for architecture?",
      options: ["Yes", "No"],
    },
    {
      question: "Do you believe low-code/no-code platforms impact traditional architecture?",
      options: ["Yes", "No"],
    },
  ],

  "Team Collaboration & Documentation": [
    {
      question: "How do you document architectural decisions?",
      options: ["ADRs (Architecture Decision Records)", "Internal wiki", "Not documented"],
    },
    {
      question: "How do teams collaborate on architecture decisions?",
      options: ["Regular meetings", "Slack/Teams discussions", "No formal process"],
    },
    {
      question: "How do you ensure code consistency across teams?",
      options: ["Linters", "Code reviews", "CI/CD rules"],
    },
    {
      question: "Do you enforce coding standards?",
      options: ["Yes", "No"],
    },
    {
      question: "Do you follow Domain-Driven Design (DDD) principles?",
      options: ["Yes", "No"],
    },
  ],
  };
  

export default surveyData