import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';



interface GooglePayload {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

interface UserDocument {
  _id: any;
  email_address?: string;
  email?: string;
  username: string;
  password?: string;
  avatar?: string | null;
  googleId?: string | null;
  authProvider?: string;
  bookmarks?: any[];
  createdAt?: Date;
  lastLogin?: Date;
  save(): Promise<any>;
  [key: string]: any;
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password') as UserDocument;

    if (!user && req.user?.authProvider === 'google') {
      res.status(200).json({
        _id: req.user.id,
        username: req.user.name,
        email: req.user.email,
        avatar: req.user.picture,
        authProvider: 'google'
      });
      return;
    }

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Error in /auth/me:', err);
    res.status(500).json({ error: "Server error" });
  }
};

const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: "No credential provided!" });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload() as GooglePayload;
    const { sub, email, name, picture } = payload;

    const user = await User.findOneAndUpdate(
      { googleId: sub },
      {
        $set: { 
          googleId: sub, 
          email, 
          username: name, 
          avatar: picture, 
          authProvider: 'google', 
          lastLogin: new Date() 
        },
        $setOnInsert: { bookmarks: [], createdAt: new Date() }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ) as UserDocument;

    const jwtToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        name: user.username, 
        authProvider: 'google' 
      },
      process.env.JWT_SICKRET_KEY_LOL as string,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      user: { 
        _id: user._id, 
        email: user.email, 
        username: user.username, 
        avatar: user.avatar, 
        authProvider: 'google' 
      },
      token: jwtToken
    });
  } catch (error) {
    console.error('Error verifying Google token', error);
    res.status(500).json({ error: "Server error" });
  }
};

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email_address, username, password } = req.body;
    const saltRounds = 10;

    bcrypt.genSalt(saltRounds, function (err: Error | null, salt: string) {
      if (err) {
        res.status(500).json({ error: err });
        return;
      }

      bcrypt.hash(password, salt, function (err: Error | null, hash: string) {
        if (err) {
          res.status(500).json({ error: err });
          return;
        }

        const newUser = new User({ email_address, username, password: hash });

        newUser.save()
          .then((user: UserDocument) => res.status(201).json({ message: "User created", user }))
          .catch((err: Error) => res.status(500).json({ error: err }));
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed." });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email_address, password } = req.body;

    const user = await User.findOne({ email_address }) as UserDocument;
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SICKRET_KEY_LOL as string,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: { username: user.username, email: user.email_address }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export { getMe, googleAuth, register, login };