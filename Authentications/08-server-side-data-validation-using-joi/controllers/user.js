const registerUser = (request, response) => {
  try {
    const user = {
      name: request.body.name,
      email: request.body.email,
      password: request.body.password,
      dob: request.body.dob,
      age: request.body.age,
      languages: request.body.languages,
      isRegistered: request.body.isRegistered,
    };
    return response.status(201).json({ message: 'user is created', user });
  } catch (error) {
    return response.status(500).send({ message: error.message });
  }
};

const loginUser = (request, response) => {
  try {
    return response.status(200).json({ message: 'user is loggedIn' });
  } catch (error) {
    return response.status(500).send({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
