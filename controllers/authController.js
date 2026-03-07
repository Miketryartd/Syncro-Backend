const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select('-password');

    if (!user && req.user.authProvider === 'google') {
      return res.status(200).json({
        _id: req.user.id,
        username: req.user.name,
        email: req.user.email,
        avatar: req.user.picture,
        authProvider: 'google'
      });
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error('Error in /auth/me:', err);
    res.status(500).json({ error: "Server error" });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "No credential provided!" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    let user = await User.findOneAndUpdate(
      { googleId: sub },
      {
        $set: { googleId: sub, email, username: name, avatar: picture, authProvider: 'google', lastLogin: new Date() },
        $setOnInsert: { bookmarks: [], createdAt: new Date() }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const jwtToken = jwt.sign(
      { id: user._id, email: user.email, name: user.username, authProvider: 'google' },
      process.env.JWT_SICKRET_KEY_LOL,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      user: { _id: user._id, email: user.email, username: user.username, avatar: user.avatar, authProvider: 'google' },
      token: jwtToken
    });
  } catch (error) {
    console.error('Error verifying Google token', error);
    res.status(500).json({ error: "Server error" });
  }
};

const register = async (req, res) => {
  try {
    const { email_address, username, password } = req.body;
    const saltRounds = 10;

    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return res.status(500).json({ error: err });

      bcrypt.hash(password, salt, function (err, hash) {
        if (err) return res.status(500).json({ error: err });

        const newUser = new User({ email_address, username, password: hash });

        newUser.save()
          .then(user => res.status(201).json({ message: "User created", user }))
          .catch(err => res.status(500).json({ error: err }));
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed." });
  }
};

const login = async (req, res) => {
  try {
    const { email_address, password } = req.body;

    const user = await User.findOne({ email_address });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SICKRET_KEY_LOL,
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

module.exports = { getMe, googleAuth, register, login };