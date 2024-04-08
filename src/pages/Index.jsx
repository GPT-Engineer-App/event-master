import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, FormLabel, Heading, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { FaSignInAlt, FaSignOutAlt, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:1337/api";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    name: "",
    description: "",
  });
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchEvents();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        setUser(data.user);
        toast({
          title: "Registration successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        setUser(data.user);
        fetchEvents();
        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    setEvents([]);
    toast({
      title: "Logout successful",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });
      const data = await response.json();
      setEvents([...events, data]);
      setFormData({ ...formData, name: "", description: "" });
      toast({
        title: "Event created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Event creation failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });
      const data = await response.json();
      const updatedEvents = events.map((event) => (event.id === eventId ? data : event));
      setEvents(updatedEvents);
      setFormData({ ...formData, name: "", description: "" });
      toast({
        title: "Event updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Event update failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedEvents = events.filter((event) => event.id !== eventId);
      setEvents(updatedEvents);
      toast({
        title: "Event deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Event deletion failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxWidth="600px" margin="auto" padding="4">
      <Heading as="h1" size="xl" textAlign="center" marginBottom="8">
        Event Management App
      </Heading>
      {!isLoggedIn ? (
        <Stack spacing="4">
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input type="text" name="username" value={formData.username} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" name="password" value={formData.password} onChange={handleChange} />
          </FormControl>
          <Button leftIcon={<FaSignInAlt />} onClick={handleRegister}>
            Register
          </Button>
          <Button leftIcon={<FaSignInAlt />} onClick={handleLogin}>
            Login
          </Button>
        </Stack>
      ) : (
        <>
          <Text fontSize="xl" marginBottom="4">
            Welcome, {user.username}!
          </Text>
          <Stack spacing="4">
            <FormControl>
              <FormLabel>Event Name</FormLabel>
              <Input type="text" name="name" value={formData.name} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Event Description</FormLabel>
              <Input type="text" name="description" value={formData.description} onChange={handleChange} />
            </FormControl>
            <Button leftIcon={<FaPlus />} onClick={handleCreateEvent}>
              Create Event
            </Button>
          </Stack>
          <Box marginTop="8">
            <Heading as="h2" size="lg" marginBottom="4">
              Events
            </Heading>
            {events.map((event) => (
              <Box key={event.id} borderWidth="1px" borderRadius="md" padding="4" marginBottom="4">
                <Heading as="h3" size="md">
                  {event.name}
                </Heading>
                <Text>{event.description}</Text>
                <Stack direction="row" spacing="2" marginTop="4">
                  <Button leftIcon={<FaEdit />} size="sm" onClick={() => handleEditEvent(event.id)}>
                    Edit
                  </Button>
                  <Button leftIcon={<FaTrash />} size="sm" onClick={() => handleDeleteEvent(event.id)}>
                    Delete
                  </Button>
                </Stack>
              </Box>
            ))}
          </Box>
          <Button leftIcon={<FaSignOutAlt />} onClick={handleLogout}>
            Logout
          </Button>
        </>
      )}
    </Box>
  );
};

export default Index;
