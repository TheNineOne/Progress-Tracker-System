// AI Service - Simulates OpenAI API interactions
import type { InterviewFeedback, ResumeAnalysis, CareerPath } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Interview Questions Database
const interviewQuestions: Record<string, string[]> = {
  'Core Java': [
    'What is Java? Why is it platform independent?',
    'What are JDK, JRE, and JVM?',
    'How Java is different from C/C++?',
    'Explain JVM architecture',
    'What is bytecode?',
    'What are access modifiers?',
    'What is the difference between == and .equals()?',
    'Why String is immutable?',
    'Difference between String, StringBuilder, StringBuffer',
    'What is final keyword (final variable, method, class)?',
    'What is OOP? Explain Encapsulation, Inheritance, Polymorphism, Abstraction.',
    'Compile time vs Runtime polymorphism',
    'Abstract class vs Interface',
    'Can interface have methods with body?',
    'Can we create object of abstract class?',
    'Multiple inheritance in Java – how?',
    'Stack vs Heap memory',
    'What is garbage collection?',
    'What is static keyword?',
    'Constructor vs Method',
    'What is this keyword? What is super keyword?',
    'What is wrapper class? Autoboxing and Unboxing',
    'What is exception? Checked vs Unchecked exception',
    'Try-catch-finally usage. What is throw vs throws?',
    'List vs Set vs Map',
    'ArrayList vs LinkedList',
    'HashMap vs Hashtable',
    'Why HashMap allows one null key?',
    'What is multithreading? Thread vs Runnable',
    'What is deadlock?',
    'Java 8 features? Lambda expression? Stream API basic idea'
  ],
  'Advanced Java': [
    'What is JDBC? JDBC architecture and steps to connect database.',
    'Statement vs PreparedStatement',
    'Why PreparedStatement is faster?',
    'What is connection pooling?',
    'What is DAO pattern?',
    'SQL Injection – how to prevent?',
    'What is Servlet? Servlet life cycle',
    'doGet vs doPost. What is web.xml?',
    'Session tracking techniques. Cookies vs HttpSession',
    'Forward vs Redirect',
    'What is filter? What is listener?',
    'What is JSP? JSP lifecycle',
    'JSP implicit objects. JSP vs Servlet',
    'Scriptlet vs Expression vs Declaration in JSP',
    'MVC in Java Web',
    'What is HTTP? HTTP methods. GET vs POST',
    'What is REST? REST vs SOAP',
    'JSON vs XML. What is API?',
    'Authentication vs Authorization',
    'What is CSRF? What is CORS?',
    'What is WAR file? What is EAR file? What is Tomcat?',
    'What is scalability? Real-time web project explanation'
  ],
  'Spring Boot': [
    'What is Spring Framework? Why Spring is used?',
    'What is Spring Boot? Spring vs Spring Boot',
    'Advantages of Spring Boot',
    'What is IOC? What is Dependency Injection? Types of DI',
    'What is Bean? Bean lifecycle',
    '@Component vs @Service vs @Repository',
    '@Autowired, @Qualifier, @Configuration, @Bean',
    '@RestController vs @Controller',
    '@RequestMapping, @GetMapping, @PostMapping',
    'What is REST API? @RequestBody, @PathVariable, @RequestParam',
    'GET vs POST vs PUT vs DELETE',
    'How validation works in Spring Boot? @Valid annotation',
    'Exception handling in Spring Boot. @ControllerAdvice',
    'What is JPA? Hibernate vs JPA',
    '@Entity, @Id, @GeneratedValue, @Column, @Table',
    'CrudRepository vs JpaRepository',
    'What is ORM? Lazy vs Eager loading',
    'application.properties / yml. Profiles in Spring Boot',
    'Logging in Spring Boot. Security basics. JWT basic idea',
    'Pagination & Sorting. File upload',
    'Spring Boot project structure. How Spring Boot app starts?'
  ],
  'Node.js & Express': [
    'What is Node.js? Why Node.js is used?',
    'Is Node.js single-threaded?',
    'What is event-driven architecture? What is non-blocking I/O?',
    'Difference between Node.js and Java',
    'What is V8 engine? What is npm? package.json purpose',
    'CommonJS vs ES Modules. require() vs import',
    'What is callback? Callback hell. What is Promise? async vs await',
    'What is event loop? setTimeout vs setImmediate',
    'What is buffer? What is stream?',
    'What is Express.js? Why Express is used? Express vs Node.js',
    'What is middleware? Types of middleware',
    'app.use() usage. app.get(), app.post()',
    'What is routing? What is REST API?',
    'What is req.params? What is req.query? What is req.body?',
    'Body-parser usage. JSON handling in Express',
    'Error handling in Express. Custom middleware',
    'How to handle file upload? How to handle CORS?',
    'How Node connects to database? What is ORM / ODM?',
    'Mongoose vs MongoDB. SQL vs NoSQL',
    'Password hashing. What is JWT? Session vs Token',
    'Environment variables. How to deploy Node app?'
  ],
  'React Frontend': [
    'What is React? Why React is used?',
    'SPA vs MPA. Virtual DOM. JSX',
    'React folder structure. Components. Functional vs Class component',
    'Props vs State',
    'What are hooks? useState, useEffect. Dependency array in useEffect',
    'useRef, useContext, useMemo, useCallback',
    'Custom hooks. Lifting state up',
    'Event handling. Controlled vs Uncontrolled components',
    'Form validation. Conditional rendering. List rendering. Key prop',
    'React Fragment. Error boundary. Refs',
    'What is React Router? BrowserRouter, Route, useParams, useNavigate',
    'Axios vs fetch for API integration',
    'Handling loading & error. CORS issue in frontend',
    'Redux basic idea. Redux vs Context API. State management',
    'Authentication flow. JWT storage in React. Protected routes',
    'Performance optimization. Build process. Deployment'
  ],
  'SQL Database': [
    'What is SQL? What are databases?',
    'Difference between DBMS and RDBMS',
    'What is a table? What is a record (row)? What is a column?',
    'What is a primary key? Can a table have multiple primary keys?',
    'What is a foreign key? What is a composite key?',
    'What is DDL? What is DML? What is DCL? What is TCL?',
    'Difference between DELETE, TRUNCATE, DROP',
    'Difference between WHERE and HAVING',
    'Difference between CHAR and VARCHAR. Difference between INT and BIGINT',
    'What is UNIQUE constraint? What is CHECK constraint?',
    'What is DEFAULT constraint? What is AUTO_INCREMENT?',
    'What is candidate key? Difference between primary key and unique key',
    'What is referential integrity? Can foreign key be null?',
    'What is index? Why index is used?',
    'What is JOIN? Types of JOINs (INNER, LEFT, RIGHT, FULL, CROSS, SELF)',
    'Difference between JOIN and SUBQUERY',
    'What are aggregate functions? (COUNT, SUM, AVG, MIN, MAX)',
    'GROUP BY, HAVING, ORDER BY, DISTINCT',
    'BETWEEN, IN vs EXISTS, LIKE operator',
    'Subquery types (Single, Multiple, Correlated)'
  ],
  'Networking': [
    'What is Computer Network? Different types of networks (LAN, MAN, WAN)',
    'What is IP Address? IPv4 vs IPv6',
    'What is MAC Address? What is DNS? What is DHCP?',
    'What is a Router? What is a Switch? Hub vs Switch',
    'What is Bandwidth? What is Latency? What is Protocol?',
    'What is HTTP and HTTPS? What is FTP?',
    'Explain OSI Model and its 7 layers. Explain TCP/IP Model.',
    'Difference between TCP and UDP?',
    'What is Subnetting? What is Default Gateway? What is ARP?',
    'What is NAT? What is Port Number? What is a Firewall?',
    'What is a Proxy Server? What is VPN?',
    'What is ICMP? What is Three-Way Handshake?',
    'What is Congestion Control in TCP?',
    'Public vs Private IP. What is CIDR? Static vs Dynamic IP',
    'Explain how HTTPS works internally. SSL/TLS handshake',
    'What is Load Balancer? What is BGP? What is OSPF?',
    'Stateful vs Stateless firewall. What is QoS? What is VLAN?',
    'Explain how data travels from your browser to a server step by step.'
  ]
};

// Simulate AI delay
const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate Interview Question
export const generateInterviewQuestion = async (role: string): Promise<string> => {
  await simulateDelay(500);
  const questions = interviewQuestions[role] || interviewQuestions['Core Java'];
  return questions[Math.floor(Math.random() * questions.length)];
};

// Evaluate Interview Answer
export const evaluateAnswer = async (
  question: string,
  answer: string,
  role: string
): Promise<InterviewFeedback> => {
  await simulateDelay(1500);

  // Simulate AI evaluation based on answer length and keywords
  const wordCount = answer.split(' ').length;
  const hasKeywords = checkKeywords(answer, role);

  const clarityScore = Math.min(10, Math.max(3, Math.round(wordCount / 10) + (hasKeywords ? 2 : 0)));
  const technicalScore = Math.min(10, Math.max(2, Math.round(wordCount / 15) + (hasKeywords ? 3 : 0)));

  const missingConcepts = getMissingConcepts(answer, question, role);
  const suggestedAnswer = generateSuggestedAnswer(question, role);

  return {
    clarityScore,
    technicalDepthScore: technicalScore,
    missingConcepts,
    suggestedAnswer,
    overallFeedback: generateOverallFeedback(clarityScore, technicalScore),
  };
};

const checkKeywords = (answer: string, role: string): boolean => {
  const keywords: Record<string, string[]> = {
    'Core Java': ['class', 'object', 'thread', 'memory', 'jvm', 'interface', 'abstract', 'polymorphism'],
    'Advanced Java': ['jdbc', 'servlet', 'jsp', 'session', 'cookie', 'request', 'response', 'api'],
    'Spring Boot': ['bean', 'dependency injection', 'ioc', 'annotation', 'rest', 'jpa', 'controller', 'service'],
    'Node.js & Express': ['event loop', 'async', 'promise', 'callback', 'middleware', 'routing', 'express', 'json'],
    'React Frontend': ['component', 'state', 'props', 'hook', 'effect', 'virtual dom', 'jsx'],
    'SQL Database': ['table', 'row', 'column', 'primary key', 'foreign key', 'join', 'select', 'where'],
    'Networking': ['ip', 'tcp', 'udp', 'osi model', 'protocol', 'dns', 'router', 'domain'],
  };

  const roleKeywords = keywords[role] || keywords['Core Java'];
  const lowerAnswer = answer.toLowerCase();
  return roleKeywords.some((kw) => lowerAnswer.includes(kw));
};

const getMissingConcepts = (answer: string, question: string, _role: string): string[] => {
  const concepts: string[] = [];
  const lowerAnswer = answer.toLowerCase();

  if (question.includes('HashMap') && !lowerAnswer.includes('thread')) {
    concepts.push('Thread safety considerations');
  }
  if (question.includes('REST') && !lowerAnswer.includes('http')) {
    concepts.push('HTTP methods and status codes');
  }
  if (!lowerAnswer.includes('example')) {
    concepts.push('Practical examples');
  }
  if (answer.length < 100) {
    concepts.push('More detailed explanation needed');
  }

  return concepts.length > 0 ? concepts : ['Good coverage of concepts!'];
};

const generateSuggestedAnswer = (question: string, _role: string): string => {
  const suggestions: Record<string, string> = {
    'HashMap': `HashMap is not thread-safe and uses a single lock for the entire map. ConcurrentHashMap uses segment-level locking (in Java 7) or CAS operations with synchronized blocks (in Java 8+), allowing concurrent read and write operations. Use HashMap for single-threaded scenarios and ConcurrentHashMap when multiple threads need concurrent access.`,
    'REST': `RESTful API best practices include: 1) Use proper HTTP methods (GET, POST, PUT, DELETE), 2) Implement proper status codes, 3) Use noun-based URLs, 4) Version your APIs, 5) Implement pagination for large datasets, 6) Use HATEOAS for discoverability, 7) Secure with HTTPS and proper authentication.`,
    'default': `A comprehensive answer should include: 1) Clear definition of concepts, 2) Practical examples, 3) Trade-offs and considerations, 4) Real-world applications, 5) Best practices and common pitfalls.`,
  };

  for (const [key, value] of Object.entries(suggestions)) {
    if (question.includes(key)) {
      return value;
    }
  }
  return suggestions['default'];
};

const generateOverallFeedback = (clarity: number, technical: number): string => {
  const avg = (clarity + technical) / 2;
  if (avg >= 8) return 'Excellent answer! You demonstrated strong understanding of the concepts.';
  if (avg >= 6) return 'Good answer with room for improvement. Consider adding more technical depth.';
  if (avg >= 4) return 'Fair attempt. Focus on providing more specific details and examples.';
  return 'Needs improvement. Review the core concepts and practice explaining them clearly.';
};

// Resume Analysis
export const analyzeResume = async (text: string, fileName: string): Promise<ResumeAnalysis> => {
  await simulateDelay(2000);

  const lowerText = text.toLowerCase();

  // Calculate ATS score based on keywords
  const techKeywords = ['java', 'python', 'javascript', 'react', 'node', 'sql', 'aws', 'docker', 'git', 'agile'];
  const foundKeywords = techKeywords.filter((kw) => lowerText.includes(kw));
  const atsScore = Math.min(100, 40 + foundKeywords.length * 6 + (text.length > 500 ? 10 : 0));

  const missingKeywords = techKeywords.filter((kw) => !lowerText.includes(kw)).slice(0, 5);

  const skillGaps = generateSkillGaps(lowerText);
  const improvements = generateImprovements(text);
  const careerPath = generateCareerPath(lowerText);
  const strengths = generateStrengths(lowerText);

  return {
    id: uuidv4(),
    fileName,
    atsScore,
    missingKeywords,
    skillGaps,
    improvements,
    careerPath,
    strengths,
    timestamp: new Date(),
  };
};

const generateSkillGaps = (text: string): string[] => {
  const gaps: string[] = [];
  if (!text.includes('cloud') && !text.includes('aws') && !text.includes('azure')) {
    gaps.push('Cloud Computing (AWS/Azure/GCP)');
  }
  if (!text.includes('docker') && !text.includes('kubernetes')) {
    gaps.push('Containerization (Docker/Kubernetes)');
  }
  if (!text.includes('ci/cd') && !text.includes('jenkins') && !text.includes('github actions')) {
    gaps.push('CI/CD Pipelines');
  }
  if (!text.includes('microservices')) {
    gaps.push('Microservices Architecture');
  }
  return gaps.length > 0 ? gaps : ['Strong technical foundation!'];
};

const generateImprovements = (text: string): string[] => {
  const improvements: string[] = [];
  if (text.length < 300) {
    improvements.push('Add more details about your projects and achievements');
  }
  if (!text.toLowerCase().includes('led') && !text.toLowerCase().includes('managed')) {
    improvements.push('Include leadership and team collaboration examples');
  }
  if (!text.match(/\d+%|\d+x|\$\d+/)) {
    improvements.push('Add quantifiable achievements (metrics, percentages, numbers)');
  }
  improvements.push('Tailor resume keywords to match job descriptions');
  improvements.push('Include relevant certifications and continuous learning');
  return improvements;
};

const generateCareerPath = (text: string): CareerPath => {
  let recommended = 'Java Developer';

  if (text.includes('python') || text.includes('machine learning')) {
    recommended = 'Python/ML Engineer';
  } else if (text.includes('react') || text.includes('frontend')) {
    recommended = 'MERN Stack Developer';
  } else if (text.includes('java') || text.includes('spring')) {
    recommended = 'Java Backend Developer';
  }

  const roadmaps: Record<string, CareerPath> = {
    'Java Backend Developer': {
      recommended: 'Java Backend Developer',
      roadmap: [
        { step: 1, title: 'Core Java Mastery', skills: ['Java 17+', 'Collections', 'Streams', 'Multithreading'], duration: '2 months' },
        { step: 2, title: 'Spring Framework', skills: ['Spring Boot', 'Spring Security', 'Spring Data JPA'], duration: '2 months' },
        { step: 3, title: 'Database & Caching', skills: ['PostgreSQL', 'Redis', 'MongoDB'], duration: '1 month' },
        { step: 4, title: 'Cloud & DevOps', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], duration: '2 months' },
      ],
    },
    'Python/ML Engineer': {
      recommended: 'Python/ML Engineer',
      roadmap: [
        { step: 1, title: 'Python Fundamentals', skills: ['Python 3', 'NumPy', 'Pandas'], duration: '1 month' },
        { step: 2, title: 'Machine Learning', skills: ['Scikit-learn', 'TensorFlow', 'PyTorch'], duration: '3 months' },
        { step: 3, title: 'Data Engineering', skills: ['SQL', 'Apache Spark', 'Data Pipelines'], duration: '2 months' },
        { step: 4, title: 'MLOps', skills: ['MLflow', 'Docker', 'Model Deployment'], duration: '1 month' },
      ],
    },
    'MERN Stack Developer': {
      recommended: 'MERN Stack Developer',
      roadmap: [
        { step: 1, title: 'Frontend Mastery', skills: ['React', 'TypeScript', 'Next.js'], duration: '2 months' },
        { step: 2, title: 'Backend Development', skills: ['Node.js', 'Express', 'REST APIs'], duration: '2 months' },
        { step: 3, title: 'Database & Auth', skills: ['MongoDB', 'PostgreSQL', 'JWT', 'OAuth'], duration: '1 month' },
        { step: 4, title: 'Full Stack Projects', skills: ['Deployment', 'Testing', 'Performance'], duration: '2 months' },
      ],
    },
  };

  return roadmaps[recommended] || roadmaps['Java Backend Developer'];
};

const generateStrengths = (text: string): string[] => {
  const strengths: string[] = [];
  if (text.includes('java')) strengths.push('Java Development');
  if (text.includes('python')) strengths.push('Python Programming');
  if (text.includes('react') || text.includes('frontend')) strengths.push('Frontend Development');
  if (text.includes('sql') || text.includes('database')) strengths.push('Database Management');
  if (text.includes('aws') || text.includes('cloud')) strengths.push('Cloud Computing');
  if (text.includes('team') || text.includes('collaboration')) strengths.push('Team Collaboration');

  return strengths.length > 0 ? strengths : ['Diverse technical background'];
};

// Code Review AI Suggestions
export const generateCodeReviewSuggestion = async (code: string): Promise<string[]> => {
  await simulateDelay(1000);

  const suggestions: string[] = [];

  if (code.includes('var ')) {
    suggestions.push('Consider using const or let instead of var for better scoping');
  }
  if (!code.includes('try') && code.includes('fetch')) {
    suggestions.push('Add error handling for async operations');
  }
  if (code.length > 500 && !code.includes('function') && !code.includes('=>')) {
    suggestions.push('Consider breaking down the code into smaller functions');
  }
  if (!code.includes('//') && !code.includes('/*')) {
    suggestions.push('Add comments to explain complex logic');
  }

  return suggestions.length > 0 ? suggestions : ['Code looks good! No major issues found.'];
};
