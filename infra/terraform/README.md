### Architecture Overview

- ECS Fargate for application
- ALB for traffic routing
- ElastiCache Redis for sessions/cart
- MongoDB Atlas for persistence
- VPC isolation (public / private subnets)

### Design Decisions

- Stateless app containers
- Externalized session store (Redis)
- Managed services to reduce ops burden
- Horizontal scalability via ECS

### Security Considerations

- Security groups
- No DB exposed publicly
- Secrets via env / Secrets Manager (future)
