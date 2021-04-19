import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import {
    Box,
    Button,
    Flex,
    Heading,
    ModalBody,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverFooter,
    PopoverHeader,
    PopoverTrigger,
    Spinner,
    Table,
    TableCaption,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useToast
} from "@chakra-ui/react";

import AppNavBar from "../../components/app/AppNavBar";
import CreateVenueModal from "../../components/app/classroom/CreateVenueModal";

import classroomsApi from "../../api/http/classrooms";
import Classroom from "../../models/Classroom";
import Status from "../../models/Status";
import User from "../../models/User";
import Lesson from "../../models/Lesson";
import Venue from "../../models/Venue";

const ClassroomSettings = (): React.ReactElement => {
    const { classroomId } = useParams<{ classroomId: string }>();

    const [classroom, setClassroom] = useState<Classroom>({ Id: "", Name: "" });
    const [classroomUsers, setClassroomUsers] = useState<User[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [createVenueModalOpen, setCreateVenueModalOpen] = useState(false);
    const [userId, setUserId] = useState("");
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [status, setStatus] = useState(Status.Loading);
    
    const toast = useToast();

    const fetchPrivilegesAndData = useCallback(async () => {
        try {
            const owner = await classroomsApi.isPrivileged(classroomId);
            if (!owner) {
                window.location.href = "/app";
                return;
            }

            await Promise.all([fetchClassroomDetails(), fetchVenues()]);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId]);

    const fetchClassroomDetails = useCallback(async () => {
        try {
            const [classroom, classroomUsers] = await Promise.all([
                classroomsApi.find(classroomId),
                classroomsApi.getUsers(classroomId),
            ]);

            setClassroomUsers(classroomUsers);
            setClassroom(classroom);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId]);

    const fetchVenues = useCallback(async () => {
        try {
            const venues = await classroomsApi.getVenues(classroomId);
            setVenues(venues);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId]);

    useEffect(() => {
        fetchPrivilegesAndData();
    }, [fetchPrivilegesAndData]);

    useEffect(() => {
        classroom && setStatus(Status.Done);
    }, [classroom]);

    const removeVenue = async (venue: Venue) => {
        try {
            await classroomsApi.deleteVenue(classroomId, venue.Id);
        } catch {
            toast({
                title: "Could not delete venue",
                description: "It is most likely still being used by a lesson.",
                status: "error",
                isClosable: true,
            });
        }
        await fetchVenues();
    };

    const closeVenueModal = () => setCreateVenueModalOpen(false);
    const createVenue = () => setCreateVenueModalOpen(true);

    return (
        <Flex w={"full"} h={"full"} direction={"column"}>
            <CreateVenueModal
                classroom={classroom}
                isOpen={createVenueModalOpen}

                onClose={closeVenueModal}
                onVenueCreated={fetchVenues}
            />
            <AppNavBar breadcrumbs={[{ name: classroom.Name, path: `/app/classrooms/${classroom.Id}` }, {
                name: "Settings",
                path: "#"
            }]}/>
            <Flex justifyContent={"center"} p={4} style={{ flex: 1 }}>
                {{
                    [Status.Loading]: <Spinner alignSelf={"center"}/>,
                    [Status.Empty]: (
                        <Flex direction={"column"} alignItems={"center"} alignSelf={"center"} style={{ flex: 1 }}>
                            <Heading size={"lg"}>No settings available</Heading>
                        </Flex>
                    ),
                    [Status.Error]: <Heading size={"lg"} alignSelf={"center"}>An unknown error occurred</Heading>,
                    [Status.Done]: (
                        <Flex style={{ flex: 1 }} direction={"column"}>
                            <Heading>Settings</Heading>
                            <Box mt={3}>
                                <Box borderWidth={1} borderRadius={"lg"} p={4}>
                                    <Heading size={"md"} mb={2}>Venues</Heading>
                                    <Table variant="simple">
                                        {venues.length === 0 && (
                                            <TableCaption>There are no venues yet, add a new one!</TableCaption>
                                        )}
                                        <Thead>
                                            <Tr>
                                                <Th>Id</Th>
                                                <Th>Name</Th>
                                                <Th>Remove</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {venues.map((venue, idx) => (
                                                <Tr key={idx.toString()}>
                                                    <Td>{venue.Id}</Td>
                                                    <Td>{venue.Name}</Td>
                                                    <Td>
                                                        <Popover>
                                                            <PopoverTrigger>
                                                                <Button colorScheme={"red"}>Remove</Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent>
                                                                <PopoverArrow/>
                                                                <PopoverCloseButton/>
                                                                <PopoverHeader>Confirmation!</PopoverHeader>
                                                                <PopoverBody>
                                                                    Are you sure you want to remove this venue? All
                                                                    associated lessons using this venue will no longer
                                                                    have a venue.
                                                                </PopoverBody>
                                                                <PopoverFooter>
                                                                    <Button colorScheme={"red"}
                                                                        onClick={async () => await removeVenue(venue)}>Confirm</Button>
                                                                </PopoverFooter>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                    <Button onClick={createVenue} mt={2}>Create new venue</Button>
                                </Box>
                            </Box>
                        </Flex>
                    )
                }[status]}
            </Flex>
        </Flex>
    );
};

export default ClassroomSettings;