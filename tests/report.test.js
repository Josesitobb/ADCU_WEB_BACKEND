const request = require('supertest');
const app = require('../server');
const db = require('../models');
const fs = require('fs');
const path = require('path');

describe('Report Module', () => {
    let authToken;
    let testReportId;

    beforeAll(async () => {
        // Login para obtener token
        const res = await request(app)
            .post('/api/auth/signin')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });
        
        authToken = res.body.accessToken;

        // Crear directorio de uploads si no existe
        const uploadPath = path.join(__dirname, '../uploads/pdfs');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
    });

    afterAll(async () => {
        // Limpiar base de datos
        await db.Report.destroy({ where: {} });
    });

    describe('PDF Upload', () => {
        it('should upload PDF files', async () => {
            const originalPDF = path.join(__dirname, 'test_files/original.pdf');
            const modifiedPDF = path.join(__dirname, 'test_files/modified.pdf');

            const res = await request(app)
                .post('/api/reports/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('original', originalPDF)
                .attach('modified', modifiedPDF)
                .field('contratista', 'Test Contratista');

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('reportId');
            testReportId = res.body.reportId;
        });

        it('should reject non-PDF files', async () => {
            const textFile = path.join(__dirname, 'test_files/test.txt');

            const res = await request(app)
                .post('/api/reports/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('original', textFile)
                .attach('modified', textFile)
                .field('contratista', 'Test Contratista');

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('Report Generation', () => {
        it('should generate a report', async () => {
            const res = await request(app)
                .get(`/api/reports/generate/${testReportId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        });

        it('should return 404 for invalid report ID', async () => {
            const res = await request(app)
                .get('/api/reports/generate/999999')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(404);
        });
    });
});