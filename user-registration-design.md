# User Registration Process Design

## Overview

This document details the complete user registration process, including profile creation, payment method setup, and product subscription linking.

## Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION FLOW                        │
│                                                                 │
│  1. User Initiates Registration                                 │
│     ↓                                                            │
│  2. Collect Basic User Information                              │
│     - Email, Password                                           │
│     - Name, Company Name                                        │
│     - Address, Phone                                            │
│     ↓                                                            │
│  3. Display Product Catalog                                     │
│     - Show available products/agents                            │
│     - Display pricing and features                              │
│     - Allow user to select products                             │
│     ↓                                                            │
│  4. User Selects Products                                        │
│     - Invoice Processor Agent                                   │
│     - Other agents (Content Writer, Data Analyst, etc.)          │
│     - Selected products stored in session                        │
│     ↓                                                            │
│  5. Collect Payment Information                                  │
│     - Credit/Debit Card Details                                 │
│     - Billing Address                                           │
│     - Payment method validation                                 │
│     ↓                                                            │
│  6. Validate All Information                                    │
│     - User data validation                                      │
│     - Product selection validation                              │
│     - Payment method validation                                 │
│     ↓                                                            │
│  7. Create Stripe Customer                                      │
│     ↓                                                            │
│  8. Create Payment Method                                        │
│     ↓                                                            │
│  9. Store User Profile in DynamoDB                              │
│     ↓                                                            │
│  10. Link Product Subscriptions                                 │
│     - Create subscription records                                │
│     - Initialize usage stats                                    │
│     - Configure product settings                                │
│     ↓                                                            │
│  11. Send Welcome Email                                         │
│     - Include selected products                                 │
│     - Onboarding instructions                                   │
│     ↓                                                            │
│  12. Return Success Response                                    │
│     - User ID, product confirmations                            │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Step 1: Get Product Catalog (Before Registration)

```http
GET /api/v1/products/catalog
```

**Response**: `200 OK`
```json
{
  "products": [
    {
      "product_id": "invoice-processor",
      "product_name": "Invoice Processor Agent",
      "description": "Automated invoice processing, extraction, and payment scheduling",
      "features": [
        "Multi-source invoice monitoring (Email, S3, Upload)",
        "AI-powered data extraction",
        "Approval workflow",
        "Automated payment scheduling"
      ],
      "pricing": {
        "model": "per_batch",
        "batch_size": 10,
        "price_per_batch": 5.00,
        "currency": "USD"
      },
      "plans": [
        {
          "plan_id": "starter",
          "name": "Starter",
          "monthly_fee": 0,
          "discount": 0
        },
        {
          "plan_id": "professional",
          "name": "Professional",
          "monthly_fee": 49,
          "discount": 0.20
        },
        {
          "plan_id": "enterprise",
          "name": "Enterprise",
          "monthly_fee": 199,
          "discount": 0.40
        }
      ],
      "icon": "https://cdn.rentaiagent.ai/icons/invoice-processor.svg",
      "category": "business"
    },
    {
      "product_id": "content-writer",
      "product_name": "Content Writer Pro",
      "description": "AI-powered content creation for blogs, articles, and marketing",
      "features": [
        "SEO optimized content",
        "Multi-language support",
        "Plagiarism free",
        "Multiple tones and styles"
      ],
      "pricing": {
        "model": "per_word",
        "price_per_100_words": 0.05,
        "currency": "USD"
      },
      "plans": [
        {
          "plan_id": "starter",
          "name": "Starter",
          "monthly_fee": 0,
          "discount": 0
        }
      ],
      "icon": "https://cdn.rentaiagent.ai/icons/content-writer.svg",
      "category": "content"
    },
    {
      "product_id": "data-analyst",
      "product_name": "Data Analyst Expert",
      "description": "Advanced data analysis with visualizations and insights",
      "features": [
        "Excel/CSV analysis",
        "Data visualizations",
        "Predictive analytics",
        "Custom reports"
      ],
      "pricing": {
        "model": "per_analysis",
        "price_per_analysis": 2.00,
        "currency": "USD"
      },
      "plans": [
        {
          "plan_id": "starter",
          "name": "Starter",
          "monthly_fee": 0,
          "discount": 0
        }
      ],
      "icon": "https://cdn.rentaiagent.ai/icons/data-analyst.svg",
      "category": "analytics"
    }
  ],
  "categories": [
    {
      "category_id": "business",
      "name": "Business Automation",
      "description": "Streamline your business operations"
    },
    {
      "category_id": "content",
      "name": "Content Creation",
      "description": "Create high-quality content at scale"
    },
    {
      "category_id": "analytics",
      "name": "Data & Analytics",
      "description": "Turn data into actionable insights"
    }
  ]
}
```

### Step 2: Register User with Selected Products

```http
POST /api/v1/register
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "SecurePassword123!",
  "profile": {
    "name": "John Doe",
    "company_name": "Acme Corp",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94105",
      "country": "USA"
    },
    "phone": "+1-555-0123"
  },
  "selected_products": [
    {
      "product_id": "invoice-processor",
      "plan": "professional"
    },
    {
      "product_id": "content-writer",
      "plan": "starter"
    }
  ],
  "payment_method": {
    "type": "card",
    "stripe_token": "tok_visa_1234",
    "billing_address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94105",
      "country": "USA"
    }
  }
}
```

## Frontend Registration Flow (Multi-Step Form)

### Step 1: Basic Information
```
┌─────────────────────────────────────────┐
│  Registration Form - Step 1/4            │
├─────────────────────────────────────────┤
│  Email: [________________]              │
│  Password: [________________]           │
│  Confirm Password: [________________]   │
│  Name: [________________]               │
│  Company Name: [________________]       │
│  Phone: [________________]              │
│                                         │
│  [Cancel]              [Next →]         │
└─────────────────────────────────────────┘
```

### Step 2: Product Selection
```
┌─────────────────────────────────────────┐
│  Select Products - Step 2/4              │
├─────────────────────────────────────────┤
│  Browse our AI Agents:                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ✓ Invoice Processor Agent       │   │
│  │   $5.00 per 10 invoices         │   │
│  │   [Professional Plan ▼]        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ☐ Content Writer Pro            │   │
│  │   $0.05 per 100 words           │   │
│  │   [Starter Plan ▼]             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ☐ Data Analyst Expert          │   │
│  │   $2.00 per analysis            │   │
│  │   [Starter Plan ▼]             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Selected: 1 product                    │
│  [← Back]              [Next →]        │
└─────────────────────────────────────────┘
```

### Step 3: Payment Information
```
┌─────────────────────────────────────────┐
│  Payment Details - Step 3/4              │
├─────────────────────────────────────────┤
│  Selected Products:                     │
│  • Invoice Processor (Professional)     │
│                                         │
│  Card Number: [________________]         │
│  Expiry: [MM/YY]  CVC: [___]           │
│  Cardholder Name: [________________]   │
│                                         │
│  Billing Address:                      │
│  Street: [________________]            │
│  City: [________________]              │
│  State: [________________]             │
│  ZIP: [________________]              │
│  Country: [United States ▼]           │
│                                         │
│  [← Back]              [Next →]        │
└─────────────────────────────────────────┘
```

### Step 4: Review & Confirm
```
┌─────────────────────────────────────────┐
│  Review & Confirm - Step 4/4             │
├─────────────────────────────────────────┤
│  Review your information:               │
│                                         │
│  Account:                               │
│  • Email: customer@example.com         │
│  • Name: John Doe                      │
│                                         │
│  Selected Products:                     │
│  • Invoice Processor (Professional)     │
│    Monthly: $49 + $5.00 per 10 invoices│
│                                         │
│  Payment Method:                        │
│  • Card ending in 4242                  │
│                                         │
│  [← Back]        [Complete Registration] │
└─────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              REGISTRATION COMPONENT ARCHITECTURE                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Gateway                                              │  │
│  │  GET /api/v1/products/catalog (Public)                   │  │
│  │  POST /api/v1/register                                    │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                       │
│         ┌───────────────┴───────────────┐                      │
│         │                               │                      │
│         ▼                               ▼                      │
│  ┌──────────────┐            ┌──────────────┐                 │
│  │  Product     │            │  Registration│                 │
│  │  Catalog     │            │  Lambda      │                 │
│  │  Lambda      │            │              │                 │
│  └──────────────┘            └──────────────┘                 │
│         │                               │                      │
│         │                               │                      │
│         ▼                               ▼                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DynamoDB Tables                                          │  │
│  │  - products (catalog)                                    │  │
│  │  - customers                                             │  │
│  │  - user_products                                         │  │
│  │  - user_profiles                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                       │
│         ┌───────────────┴───────────────┐                      │
│         │                               │                      │
│         ▼                               ▼                      │
│  ┌──────────────┐            ┌──────────────┐                 │
│  │  Validation  │            │  Stripe      │                 │
│  │  Service     │            │  Integration │                 │
│  └──────────────┘            └──────────────┘                 │
│         │                               │                      │
│         └───────────────┬───────────────┘                      │
│                         │                                       │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AWS SES                                                  │  │
│  │  Welcome Email                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Registration Lambda Process

### Step-by-Step Process

#### Step 1: Input Validation
```python
def validate_registration_input(data):
    # Validate email format
    if not is_valid_email(data['email']):
        raise ValidationError("Invalid email format")
    
    # Validate password strength
    if not is_strong_password(data['password']):
        raise ValidationError("Password does not meet requirements")
    
    # Validate required fields
    required_fields = ['email', 'password', 'profile', 'payment_method', 'selected_products']
    for field in required_fields:
        if field not in data:
            raise ValidationError(f"Missing required field: {field}")
    
    # Validate product selection
    if not data['selected_products'] or len(data['selected_products']) == 0:
        raise ValidationError("At least one product must be selected")
    
    # Validate each selected product
    for product in data['selected_products']:
        if 'product_id' not in product:
            raise ValidationError("Each product must have a product_id")
        if 'plan' not in product:
            raise ValidationError("Each product must have a plan selected")
    
    return True
```

#### Step 2: Check Email Uniqueness
```python
def check_email_exists(email):
    # Query DynamoDB customers table
    response = dynamodb.query(
        TableName='customers',
        IndexName='email-index',
        KeyConditionExpression='email = :email',
        ExpressionAttributeValues={':email': email}
    )
    
    if response['Items']:
        raise ConflictError("Email already registered")
    
    return False
```

#### Step 3: Create Stripe Customer
```python
def create_stripe_customer(profile, email):
    stripe_customer = stripe.Customer.create(
        email=email,
        name=profile['name'],
        metadata={
            'company_name': profile.get('company_name', ''),
            'user_id': generate_user_id()
        }
    )
    
    return stripe_customer.id
```

#### Step 4: Create Payment Method
```python
def create_payment_method(stripe_customer_id, payment_data):
    # Create payment method
    payment_method = stripe.PaymentMethod.create(
        type=payment_data['type'],
        card={'token': payment_data['stripe_token']}
    )
    
    # Attach to customer
    payment_method.attach(customer=stripe_customer_id)
    
    # Set as default
    stripe.Customer.modify(
        stripe_customer_id,
        invoice_settings={'default_payment_method': payment_method.id}
    )
    
    return payment_method.id
```

#### Step 5: Hash Password
```python
import bcrypt

def hash_password(password):
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')
```

#### Step 6: Store User Profile
```python
def store_user_profile(user_data, stripe_customer_id, payment_method_id):
    user_id = generate_user_id()
    timestamp = datetime.utcnow().isoformat()
    
    # Store in customers table
    dynamodb.put_item(
        TableName='customers',
        Item={
            'user_id': user_id,
            'email': user_data['email'],
            'password_hash': hash_password(user_data['password']),
            'stripe_customer_id': stripe_customer_id,
            'default_payment_method_id': payment_method_id,
            'status': 'active',
            'created_at': timestamp,
            'updated_at': timestamp
        }
    )
    
    # Store profile in user_profiles table
    dynamodb.put_item(
        TableName='user_profiles',
        Item={
            'user_id': user_id,
            'name': user_data['profile']['name'],
            'company_name': user_data['profile'].get('company_name', ''),
            'address': user_data['profile']['address'],
            'phone': user_data['profile'].get('phone', ''),
            'created_at': timestamp,
            'updated_at': timestamp
        }
    )
    
    return user_id
```

#### Step 7: Validate Selected Products
```python
def validate_selected_products(selected_products):
    # Get product catalog from DynamoDB
    products_catalog = get_products_catalog()
    valid_product_ids = {p['product_id'] for p in products_catalog}
    
    for selected in selected_products:
        product_id = selected['product_id']
        plan = selected['plan']
        
        # Check if product exists
        if product_id not in valid_product_ids:
            raise ValidationError(f"Invalid product_id: {product_id}")
        
        # Get product details
        product = next(p for p in products_catalog if p['product_id'] == product_id)
        
        # Validate plan exists for product
        valid_plans = [p['plan_id'] for p in product['plans']]
        if plan not in valid_plans:
            raise ValidationError(f"Invalid plan '{plan}' for product '{product_id}'")
    
    return True
```

#### Step 8: Link Products
```python
def link_user_products(user_id, selected_products, products_catalog):
    timestamp = datetime.utcnow().isoformat()
    
    # Get product details from catalog
    catalog_dict = {p['product_id']: p for p in products_catalog}
    
    for selected in selected_products:
        product_id = selected['product_id']
        plan = selected['plan']
        product_info = catalog_dict[product_id]
        
        # Store product subscription
        dynamodb.put_item(
            TableName='user_products',
            Item={
                'user_id': user_id,
                'product_id': product_id,
                'product_name': product_info['product_name'],
                'plan': plan,
                'status': 'active',
                'subscription_date': timestamp,
                'created_at': timestamp,
                'updated_at': timestamp
        })
        
        # Initialize usage stats for product
        dynamodb.put_item(
            TableName='usage_stats',
            Item={
                'user_id': user_id,
                'period': get_current_period(),  # YYYY-MM
                'agent_type': product_id,
                'usage_count': 0,
                'billing_threshold': get_billing_threshold(product_id, plan),
                'last_billed_at': None,
                'total_charges': 0,
                'updated_at': timestamp
            }
        )
        
        # Initialize product-specific settings
        initialize_product_settings(user_id, product_id, plan)
```

#### Step 9: Send Welcome Email
```python
def send_welcome_email(email, name, selected_products, products_catalog):
    # Get product names from catalog
    catalog_dict = {p['product_id']: p for p in products_catalog}
    product_names = [
        catalog_dict[p['product_id']]['product_name'] 
        for p in selected_products
    ]
    
    ses.send_email(
        Source='noreply@rentaiagent.ai',
        Destination={'ToAddresses': [email]},
        Message={
            'Subject': {'Data': 'Welcome to RentAIAgent.ai!'},
            'Body': {
                'Html': {
                    'Data': generate_welcome_email_html(name, selected_products, product_names)
                }
            }
        }
    )
```

## Database Schema

### customers Table
```json
{
  "TableName": "customers",
  "KeySchema": [
    {
      "AttributeName": "user_id",
      "KeyType": "HASH"
    }
  ],
  "AttributeDefinitions": [
    {
      "AttributeName": "user_id",
      "AttributeType": "S"
    },
    {
      "AttributeName": "email",
      "AttributeType": "S"
    }
  ],
  "GlobalSecondaryIndexes": [
    {
      "IndexName": "email-index",
      "KeySchema": [
        {
          "AttributeName": "email",
          "KeyType": "HASH"
        }
      ],
      "Projection": {
        "ProjectionType": "ALL"
      }
    }
  ]
}
```

**Attributes**:
- `user_id`: String (Primary Key)
- `email`: String (Unique, GSI)
- `password_hash`: String
- `stripe_customer_id`: String
- `default_payment_method_id`: String
- `status`: String (active|suspended|cancelled)
- `created_at`: String
- `updated_at`: String

### user_profiles Table
```json
{
  "TableName": "user_profiles",
  "KeySchema": [
    {
      "AttributeName": "user_id",
      "KeyType": "HASH"
    }
  ]
}
```

**Attributes**:
- `user_id`: String (Primary Key)
- `name`: String
- `company_name`: String
- `address`: Map
  - `street`: String
  - `city`: String
  - `state`: String
  - `zip`: String
  - `country`: String
- `phone`: String
- `created_at`: String
- `updated_at`: String

### user_products Table
```json
{
  "TableName": "user_products",
  "KeySchema": [
    {
      "AttributeName": "user_id",
      "KeyType": "HASH"
    },
    {
      "AttributeName": "product_id",
      "KeyType": "RANGE"
    }
  ],
  "GlobalSecondaryIndexes": [
    {
      "IndexName": "product-status-index",
      "KeySchema": [
        {
          "AttributeName": "product_id",
          "KeyType": "HASH"
        },
        {
          "AttributeName": "status",
          "KeyType": "RANGE"
        }
      ],
      "Projection": {
        "ProjectionType": "ALL"
      }
    }
  ]
}
```

**Attributes**:
- `user_id`: String (Partition Key)
- `product_id`: String (Sort Key)
- `product_name`: String
- `plan`: String (starter|professional|enterprise)
- `status`: String (active|paused|cancelled)
- `subscription_date`: String
- `created_at`: String
- `updated_at`: String

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "user_id": "user-123",
    "email": "customer@example.com",
    "stripe_customer_id": "cus_1234",
    "payment_method_id": "pm_1234",
    "selected_products": [
      {
        "product_id": "invoice-processor",
        "product_name": "Invoice Processor Agent",
        "plan": "professional",
        "status": "active",
        "subscription_date": "2024-01-15T10:30:00Z"
      },
      {
        "product_id": "content-writer",
        "product_name": "Content Writer Pro",
        "plan": "starter",
        "status": "active",
        "subscription_date": "2024-01-15T10:30:00Z"
      }
    ],
    "profile": {
      "name": "John Doe",
      "company_name": "Acme Corp"
    },
    "next_steps": [
      "Complete your profile setup",
      "Configure your first invoice source",
      "Start using your selected agents"
    ]
  },
  "message": "Registration successful. Welcome email sent."
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Email address is already registered",
    "details": {
      "email": "customer@example.com"
    }
  }
}
```

## Error Handling

### Validation Errors
- **Invalid Email Format**: Return 400 Bad Request
- **Weak Password**: Return 400 Bad Request with requirements
- **Missing Required Fields**: Return 400 Bad Request
- **No Products Selected**: Return 400 Bad Request

### Business Logic Errors
- **Email Already Exists**: Return 409 Conflict
- **Invalid Product ID**: Return 400 Bad Request
- **Invalid Plan for Product**: Return 400 Bad Request
- **Stripe API Error**: Return 502 Bad Gateway
- **Database Error**: Return 500 Internal Server Error

### Retry Logic
- **Stripe API Failures**: Retry 3 times with exponential backoff
- **DynamoDB Throttling**: Retry with exponential backoff
- **SES Email Failures**: Log and continue (non-blocking)

## Security Considerations

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Requirements**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

### Data Encryption
- **In Transit**: TLS 1.2+
- **At Rest**: DynamoDB encryption with AWS KMS
- **Sensitive Data**: Never log passwords or payment tokens

### Input Validation
- **Email**: RFC 5322 compliant validation
- **Phone**: E.164 format validation
- **Address**: Sanitize and validate
- **SQL Injection**: Not applicable (NoSQL)
- **XSS**: Sanitize all user inputs

## Product Catalog Service

### Product Catalog Lambda
- **Function**: `get-product-catalog`
- **Trigger**: API Gateway (GET /api/v1/products/catalog)
- **Runtime**: Python 3.11
- **Memory**: 256 MB
- **Timeout**: 10 seconds
- **Cache**: ElastiCache (5 minute TTL)

### Product Catalog Data Source

#### products Table (DynamoDB)
```json
{
  "TableName": "products",
  "KeySchema": [
    {
      "AttributeName": "product_id",
      "KeyType": "HASH"
    }
  ],
  "GlobalSecondaryIndexes": [
    {
      "IndexName": "category-index",
      "KeySchema": [
        {
          "AttributeName": "category",
          "KeyType": "HASH"
        },
        {
          "AttributeName": "status",
          "KeyType": "RANGE"
        }
      ]
    }
  ]
}
```

**Attributes**:
- `product_id`: String (Primary Key)
- `product_name`: String
- `description`: String
- `category`: String
- `features`: List
- `pricing`: Map
- `plans`: List
- `icon_url`: String
- `status`: String (active|inactive|coming_soon)
- `created_at`: String
- `updated_at`: String

### Product Catalog Response Structure
```json
{
  "products": [
    {
      "product_id": "invoice-processor",
      "product_name": "Invoice Processor Agent",
      "description": "Automated invoice processing, extraction, and payment scheduling",
      "category": "business",
      "features": [
        "Multi-source invoice monitoring",
        "AI-powered data extraction",
        "Approval workflow",
        "Automated payment scheduling"
      ],
      "pricing": {
        "model": "per_batch",
        "batch_size": 10,
        "price_per_batch": 5.00,
        "currency": "USD"
      },
      "plans": [
        {
          "plan_id": "starter",
          "name": "Starter",
          "monthly_fee": 0,
          "discount": 0,
          "features": ["Basic invoice processing"]
        },
        {
          "plan_id": "professional",
          "name": "Professional",
          "monthly_fee": 49,
          "discount": 0.20,
          "features": [
            "Advanced invoice processing",
            "Priority support",
            "Custom integrations"
          ]
        }
      ],
      "icon_url": "https://cdn.rentaiagent.ai/icons/invoice-processor.svg",
      "status": "active"
    }
  ],
  "categories": [
    {
      "category_id": "business",
      "name": "Business Automation",
      "description": "Streamline your business operations"
    }
  ]
}
```

## Product Linking Details

### Product Configuration
When a product is linked:
1. **Validate Product Selection**: Check product exists and plan is valid
2. **Create Subscription Record**: Store in `user_products` table
3. **Initialize Usage Stats**: Create entry in `usage_stats` table
4. **Set Default Settings**: Configure product-specific default settings
5. **Grant Permissions**: Set up IAM roles for product access (if needed)
6. **Initialize Product Data**: Create any required initial data structures

### Product Activation
- **Immediate**: Product is active upon registration
- **Trial Period**: Optional trial period (e.g., 14 days) - configurable per product
- **Usage Limits**: Based on selected plan
- **Feature Access**: Based on selected plan

### Product-Specific Initialization

#### Invoice Processor Agent
```python
def initialize_invoice_processor_settings(user_id, plan):
    # Create default invoice source configuration
    default_source = {
        'user_id': user_id,
        'source_type': 'upload',
        'status': 'active',
        'created_at': datetime.utcnow().isoformat()
    }
    
    # Store in invoice_sources table
    dynamodb.put_item(
        TableName='invoice_sources',
        Item=default_source
    )
    
    # Set plan-specific limits
    if plan == 'professional':
        # Higher limits for professional plan
        limits = {
            'max_invoices_per_month': 1000,
            'max_file_size_mb': 10
        }
    else:
        limits = {
            'max_invoices_per_month': 100,
            'max_file_size_mb': 5
        }
    
    # Store limits in user_settings table
    dynamodb.put_item(
        TableName='user_settings',
        Item={
            'user_id': user_id,
            'product_id': 'invoice-processor',
            'settings': limits,
            'updated_at': datetime.utcnow().isoformat()
        }
    )
```

## Welcome Email Template

```html
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to RentAIAgent.ai</title>
</head>
<body>
    <h1>Welcome, {{name}}!</h1>
    <p>Thank you for registering with RentAIAgent.ai.</p>
    
    <h2>Your Subscribed Products:</h2>
    <ul>
        {% for product in selected_products %}
        <li>
            <strong>{{product.product_name}}</strong> 
            ({{product.plan}} plan)
            <br>
            <small>Activated and ready to use</small>
        </li>
        {% endfor %}
    </ul>
    
    <h2>Next Steps:</h2>
    <ol>
        <li>Complete your profile setup</li>
        <li>Configure your first agent</li>
        <li>Start using your selected AI agents</li>
    </ol>
    
    <p><a href="https://app.rentaiagent.ai/dashboard">Go to Dashboard</a></p>
    
    <p>Need help? Check out our <a href="https://docs.rentaiagent.ai">documentation</a> or contact support.</p>
</body>
</html>
```

## Frontend Implementation Guide

### Product Catalog Display

#### Component Structure
```javascript
// ProductCatalog.jsx
const ProductCatalog = ({ onProductSelect }) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch product catalog
    fetch('/api/v1/products/catalog')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products);
        setLoading(false);
      });
  }, []);

  const handleProductToggle = (productId, plan) => {
    // Toggle product selection
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.product_id === productId);
      if (exists) {
        return prev.filter(p => p.product_id !== productId);
      } else {
        return [...prev, { product_id: productId, plan }];
      }
    });
  };

  return (
    <div className="product-catalog">
      <h2>Select AI Agents</h2>
      <div className="products-grid">
        {products.map(product => (
          <ProductCard
            key={product.product_id}
            product={product}
            isSelected={selectedProducts.some(p => p.product_id === product.product_id)}
            onSelect={handleProductToggle}
          />
        ))}
      </div>
      <div className="selected-summary">
        <p>Selected: {selectedProducts.length} product(s)</p>
      </div>
    </div>
  );
};
```

#### Product Card Component
```javascript
// ProductCard.jsx
const ProductCard = ({ product, isSelected, onSelect }) => {
  const [selectedPlan, setSelectedPlan] = useState('starter');

  return (
    <div className={`product-card ${isSelected ? 'selected' : ''}`}>
      <div className="product-header">
        <img src={product.icon_url} alt={product.product_name} />
        <h3>{product.product_name}</h3>
      </div>
      
      <p className="description">{product.description}</p>
      
      <div className="features">
        <h4>Features:</h4>
        <ul>
          {product.features.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
      </div>
      
      <div className="pricing">
        <p className="price">
          {product.pricing.model === 'per_batch' 
            ? `$${product.pricing.price_per_batch} per ${product.pricing.batch_size}`
            : `$${product.pricing.price_per_100_words} per 100 words`
          }
        </p>
      </div>
      
      <div className="plan-selection">
        <select 
          value={selectedPlan} 
          onChange={(e) => setSelectedPlan(e.target.value)}
        >
          {product.plans.map(plan => (
            <option key={plan.plan_id} value={plan.plan_id}>
              {plan.name} 
              {plan.monthly_fee > 0 && ` ($${plan.monthly_fee}/month)`}
            </option>
          ))}
        </select>
      </div>
      
      <button 
        onClick={() => onSelect(product.product_id, selectedPlan)}
        className={isSelected ? 'btn-selected' : 'btn-select'}
      >
        {isSelected ? '✓ Selected' : 'Select Product'}
      </button>
    </div>
  );
};
```

### Registration Form Flow

#### Multi-Step Form Component
```javascript
// RegistrationForm.jsx
const RegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    profile: {},
    selected_products: [],
    payment_method: {}
  });

  const steps = [
    { id: 1, title: 'Account Information', component: <AccountInfoStep /> },
    { id: 2, title: 'Select Products', component: <ProductSelectionStep /> },
    { id: 3, title: 'Payment Details', component: <PaymentStep /> },
    { id: 4, title: 'Review & Confirm', component: <ReviewStep /> }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    // Submit registration
    const response = await fetch('/api/v1/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="registration-form">
      <div className="progress-bar">
        {steps.map((step, idx) => (
          <div 
            key={step.id}
            className={`step ${idx + 1 <= currentStep ? 'active' : ''}`}
          >
            {step.id}. {step.title}
          </div>
        ))}
      </div>
      
      <div className="form-content">
        {steps[currentStep - 1].component}
      </div>
      
      <div className="form-actions">
        {currentStep > 1 && (
          <button onClick={() => setCurrentStep(currentStep - 1)}>
            Back
          </button>
        )}
        {currentStep < steps.length ? (
          <button onClick={handleNext}>Next</button>
        ) : (
          <button onClick={handleSubmit}>Complete Registration</button>
        )}
      </div>
    </div>
  );
};
```

## Monitoring & Metrics

### Key Metrics
- Registration success rate
- Registration failure rate by error type
- Average registration time
- Stripe API latency
- DynamoDB write latency
- Email delivery rate

### Alarms
- High registration failure rate (>5%)
- Slow registration time (>5 seconds)
- Stripe API errors
- DynamoDB throttling
- Email delivery failures

## Testing Scenarios

### Happy Path
1. Valid registration data
2. New email address
3. Valid payment method
4. Product selection
5. All services available

### Error Scenarios
1. Duplicate email
2. Invalid email format
3. Weak password
4. Stripe API failure
5. DynamoDB throttling
6. Missing required fields

### Edge Cases
1. Multiple products selected
2. Special characters in name/address
3. International phone numbers
4. Long company names
5. Concurrent registrations with same email

## Implementation Checklist

- [ ] Create registration Lambda function
- [ ] Set up DynamoDB tables
- [ ] Configure Stripe integration
- [ ] Set up SES for emails
- [ ] Implement validation logic
- [ ] Add error handling
- [ ] Create welcome email template
- [ ] Set up monitoring and alarms
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Performance testing
- [ ] Security review

## Cost Considerations

### Per Registration
- **Lambda**: ~$0.0000002 (1 invocation)
- **DynamoDB**: ~$0.00025 (3 writes)
- **Stripe API**: Free (customer creation)
- **SES**: $0.10 per 1000 emails
- **Total**: ~$0.00025 per registration

### Monthly Estimates (1000 registrations)
- **Lambda**: $0.20
- **DynamoDB**: $0.25
- **Stripe**: Free
- **SES**: $0.10
- **Total**: ~$0.55/month

## Future Enhancements

1. **Email Verification**: Require email confirmation before activation
2. **Social Login**: OAuth integration (Google, Microsoft)
3. **Multi-Factor Authentication**: Optional 2FA setup
4. **Referral Program**: Track referral codes
5. **Onboarding Flow**: Step-by-step guided setup
6. **Product Recommendations**: Suggest additional products
7. **Trial Periods**: Free trial for new products

