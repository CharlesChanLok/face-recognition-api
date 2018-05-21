import UserService from "../services/UserService";
import * as express from 'express';
import { Request, Response } from 'express';

/**
*   User Router
*   Requests from : '/'
*/

class UserRouter {
    constructor(private userService: UserService) {
        this.userService = userService;
    }

    getRouter = () => {
        const router = express.Router();
        router.post('/signin', this.handleSignIn);
        router.post('/signup', this.handleSignUp);
        router.get('/profile/:id', this.handleUserProfile);
        router.put('/image', this.handleImage);
        return router;
    }

    handleSignUp = async (req: Request, res: Response) => {
        const { name, email, password } = req.body;
        if (name && email && password) {
            try {
                const user = await this.userService.userSignUp(name, email, password);
                return res.json(user);
            }
            catch (err) {
                console.log(err);
                return res.status(404).json(err);
            }
        } else {
            return res.status(400).json('Please provide a valid credentials');
        }
    }

    handleSignIn = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        if (email && password) {
            try {
                const user = await this.userService.userSignIn(email, password);
                return res.json(user);
            }
            catch (err) {
                return res.status(404).json(err);
            }
        } else {
            return res.status(400).json('Please provide a valid credentials');
        }
    }

    handleUserProfile = async (req: Request, res: Response) => {
        try {
            const user = await this.userService.findUserById(req.params.id);
            return res.json(user);
        }
        catch (err) {
            return res.status(404).json(err);
        }
    }
    handleImage = async (req: Request, res: Response) => {
        const { id } = req.body;
        try {
            const entries = await this.userService.AddEntries(id);
            return res.json(entries);
        }
        catch (err) {
            return res.status(404).json(err);
        }
    }
}

export default UserRouter;