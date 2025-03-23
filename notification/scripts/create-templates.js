const mongoose = require('mongoose');
const dotEnv = require('dotenv');

// Load environment variables
if (process.env.NODE_ENV !== 'prod') {
    const configFile = `./.env.${process.env.NODE_ENV || 'dev'}`;
    dotEnv.config({ path: configFile });
} else {
    dotEnv.config();
}

const DB_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/notification-service';

// Define the Template schema (simplified version of your actual schema)
const TemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ['email', 'sms', 'inapp']
    },
    subject: {
        type: String,
        required: function() { return this.type === 'email'; }
    },
    content: {
        type: String,
        required: true
    },
    variables: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Template = mongoose.model('Template', TemplateSchema);

// Templates to create
const templates = [
    {
        name: 'welcome_email',
        type: 'email',
        subject: 'Welcome to Our Platform',
        content: `
            <html>
                <body>
                    <h1>Welcome, {{firstName}} {{lastName}}!</h1>
                    <p>Thank you for joining our platform. We're excited to have you on board!</p>
                    <p>To activate your account, please click the link below:</p>
                    <p><a href="{{activationLink}}">Activate Your Account</a></p>
                    <p>If you have any questions, feel free to contact our support team.</p>
                    <p>Best regards,<br>The Team</p>
                </body>
            </html>
        `,
        variables: ['firstName', 'lastName', 'activationLink'],
        isActive: true
    },
    {
        name: 'order_confirmation',
        type: 'email',
        subject: 'Order Confirmation #{{orderNumber}}',
        content: `
            <html>
                <body>
                    <h1>Order Confirmation</h1>
                    <p>Dear {{customerName}},</p>
                    <p>Thank you for your order! We've received your order #{{orderNumber}} and are processing it now.</p>
                    <h2>Order Details:</h2>
                    <p>Order Date: {{orderDate}}</p>
                    <p>Total Amount: {{totalAmount}}</p>
                    <p>Shipping Address: {{shippingAddress}}</p>
                    <p>You will receive another email when your order ships.</p>
                    <p>Best regards,<br>The Team</p>
                </body>
            </html>
        `,
        variables: ['customerName', 'orderNumber', 'orderDate', 'totalAmount', 'shippingAddress'],
        isActive: true
    },
    {
        name: 'password_reset',
        type: 'email',
        subject: 'Password Reset Request',
        content: `
            <html>
                <body>
                    <h1>Password Reset</h1>
                    <p>Dear {{firstName}},</p>
                    <p>We received a request to reset your password. Click the link below to set a new password:</p>
                    <p><a href="{{resetLink}}">Reset Password</a></p>
                    <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
                    <p>This link will expire in 1 hour.</p>
                    <p>Best regards,<br>The Team</p>
                </body>
            </html>
        `,
        variables: ['firstName', 'resetLink'],
        isActive: true
    },
    {
        name: 'order_shipped',
        type: 'email',
        subject: 'Your Order #{{orderNumber}} Has Shipped',
        content: `
            <html>
                <body>
                    <h1>Order Shipped</h1>
                    <p>Dear {{customerName}},</p>
                    <p>Great news! Your order #{{orderNumber}} has been shipped.</p>
                    <p>Tracking Number: {{trackingNumber}}</p>
                    <p>Carrier: {{carrier}}</p>
                    <p>Estimated Delivery: {{estimatedDelivery}}</p>
                    <p>You can track your package <a href="{{trackingLink}}">here</a>.</p>
                    <p>Best regards,<br>The Team</p>
                </body>
            </html>
        `,
        variables: ['customerName', 'orderNumber', 'trackingNumber', 'carrier', 'estimatedDelivery', 'trackingLink'],
        isActive: true
    },
    {
        name: 'payment_confirmation',
        type: 'email',
        subject: 'Payment Confirmation for Order #{{orderNumber}}',
        content: `
            <html>
                <body>
                    <h1>Payment Confirmation</h1>
                    <p>Dear {{customerName}},</p>
                    <p>We've received your payment of {{amount}} for order #{{orderNumber}}.</p>
                    <p>Payment Details:</p>
                    <ul>
                        <li>Payment ID: {{paymentId}}</li>
                        <li>Payment Date: {{paymentDate}}</li>
                        <li>Payment Method: {{paymentMethod}}</li>
                    </ul>
                    <p>Thank you for your business!</p>
                    <p>Best regards,<br>The Team</p>
                </body>
            </html>
        `,
        variables: ['customerName', 'amount', 'orderNumber', 'paymentId', 'paymentDate', 'paymentMethod'],
        isActive: true
    }
];

// Connect to MongoDB and create templates
async function createTemplates() {
    try {
        await mongoose.connect(DB_URL);
        console.log('Connected to MongoDB');

        // Create templates
        for (const template of templates) {
            try {
                // Check if template already exists
                const existingTemplate = await Template.findOne({ name: template.name });
                
                if (existingTemplate) {
                    console.log(`Template '${template.name}' already exists, updating...`);
                    await Template.updateOne({ name: template.name }, template);
                } else {
                    console.log(`Creating template '${template.name}'...`);
                    await Template.create(template);
                }
            } catch (err) {
                console.error(`Error creating/updating template '${template.name}':`, err.message);
            }
        }

        console.log('Templates created/updated successfully');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createTemplates(); 