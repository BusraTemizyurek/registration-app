require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const { sql } = require('@vercel/postgres');
const { auth } = require('express-openid-connect');
const path = require('path');

const port = process.env.PORT || 3000;

app.options('*', cors());
app.use(cors());

app.use(express.json());

function getBaseUrl(hostname) {
    return hostname === 'localhost' ? `http://localhost:${port}` : `https://${hostname}`;
}

app.use((req, res, next) => {
    return auth({
        authRequired: true,
        auth0Logout: true,
        secret: process.env.AUTH_CLIENT_SECRET,
        baseURL: getBaseUrl(req.hostname),
        clientID: process.env.AUTH_CLIENT_ID,
        issuerBaseURL: process.env.AUTH_ISSUER_BASE_URL,
    })(req, res, next);
});

app.use(express.static(path.join(__dirname, "..", 'client')));

app.use('/api/user', (req, res) => {
    res.json(req.oidc.user);
});

app.get('/api', async function (req, res) {
    try {
        const result = await sql`SELECT * FROM "customer_records";`
        return res.json(result.rows);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

app.get('/api/:id', async function (req, res) {
    const { id } = req.params;
    try {
        const result = await sql`SELECT * FROM "customer_records" WHERE id=${id};`
        if (result.rows.length === 0) {
            return res.status(404).send();
        }
        return res.json(result.rows[0]);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});
app.put('/api/:id', async (req, res) => {
    const { id } = req.params;
    const { customer, user, date, branch, subject, price, explanation, phone_number } = req.body;
    try {
        const result = await sql`
            UPDATE "customer_records"
            SET "customer" = ${customer}, "user" = ${user}, "date" = ${date}, "branch" = ${branch}, "subject" = ${subject}, "price" = ${Number.parseFloat(price)}, "explanation" = ${explanation}, "phone_number" = ${phone_number}
            WHERE "id" = ${id};
        `;
        if (result.rowCount === 0) {
            return res.status(404).send();
        }
        res.status(200).send();
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

app.post('/api', async (req, res) => {
    const { customer, user, date, branch, subject, price, explanation, phone_number } = req.body;
    try {

        await sql`INSERT INTO "customer_records" ("customer", "user", "date", "branch", "subject", "price", "explanation", "phone_number")
                    VALUES (${customer}, ${user}, ${date}, ${branch}, ${subject}, ${Number.parseFloat(price)}, ${explanation}, ${phone_number});`;
        res.status(201).send();
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

app.delete('/api/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql`DELETE FROM "customer_records" WHERE id = ${id};`;

        // Check if the record was deleted
        if (result.count === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.status(200).json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

if (require.main === module) {
    app.listen(port, () => console.log(`Server ready on port ${port}.`));
}

module.exports = app;