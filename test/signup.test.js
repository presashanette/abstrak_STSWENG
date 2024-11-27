const mockingoose = require('mockingoose');
const { signup } = require('../src/controllers/signupController'); 
const User = require('../src/models/User');

describe('Signup Backend Test', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                firstName: 'John',
                lastName: 'Doe',
                username: 'johndoe',
                password: 'password123',
                email: 'johndoe@example.com',
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('should successfully create a new user with default fields', async () => {
        mockingoose(User).toReturn(null, 'findOne');

        const newUser = {
            ...req.body,
            profilePicture: 'default.jpg',
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockingoose(User).toReturn(newUser, 'save');

        await signup(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            redirectUrl: '/login',
        });
    });

    it('should return an error if the username is already taken', async () => {
        mockingoose(User).toReturn({ username: 'johndoe' }, 'findOne');

        await signup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Username is already taken.',
        });
    });

    it('should return an error if the email is already taken', async () => {

        req.body.username = 'newusername'; 
        mockingoose(User).toReturn({ email: 'johndoe@example.com' }, 'findOne');

        await signup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Username is already taken.',
        });
    });
});
