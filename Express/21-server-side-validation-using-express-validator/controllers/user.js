const registerUser = (request, response) => {
  try {
    const { name, email, password, dob } = request.body;
    const newUser = {
      name,
      email,
      password,
      dob,
    };
    response.status(201).json({ message: 'user is created', newUser });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

const loginUser = (request, response) => {
  try {
    const { email, password } = request.body;
    if (email == 'tahasin.oyshik@gmail.com' && password == '12345') {
      response.status(200).json({ message: 'user is loggedIn' });
    } else {
      response.status(400).json({ message: 'email/password is wrong' });
    }
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
