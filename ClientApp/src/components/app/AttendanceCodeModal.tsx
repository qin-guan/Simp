import * as React from "react";
import { useEffect, useState, useCallback } from "react";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    Progress,
    Heading,
    Center,
    Spinner,
    Box
} from "@chakra-ui/react";

import { getAttendanceCode } from "../../api/http/lessons";

import Lesson from "../../models/Lesson";
import Classroom from "../../models/Classroom";
import Status from "../../models/Status";

interface AttendanceCodeModalProps {
    isOpen: boolean;
    classroom: Classroom;
    lesson: Lesson;

    onClose: () => void;
}

const AttendanceCodeModal = (props: AttendanceCodeModalProps): React.ReactElement => {
    const { isOpen, onClose, classroom, lesson } = props;

    const [status, setStatus] = useState<Status>(Status.Loading);

    const [countdown, setCountdown] = useState(100);
    const [code, setCode] = useState<number>();

    const fetchAttendeeCode = useCallback(async () => {
        try {
            const res = await getAttendanceCode(classroom.Id, lesson.Id);
            if (res !== code) {
                setCountdown(100);
            }
            setCode(res);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroom.Id, lesson.Id, code]);

    useEffect(() => {
        const timer = setInterval(fetchAttendeeCode, 1000);
        fetchAttendeeCode();
        setStatus(Status.Done);

        return () => {
            clearInterval(timer);
        };
    }, [fetchAttendeeCode]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (countdown <= 0) setCountdown(100);
            else setCountdown(c => c - 100 / 30);
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [countdown]);

    return (
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay/>
            <ModalContent>
                <ModalCloseButton/>
                <ModalBody p={10}>
                    {{
                        [Status.Loading]: <Spinner alignSelf={"center"}/>,
                        [Status.Empty]: <></>,
                        [Status.Error]: <Heading size={"lg"} alignSelf={"center"}>An unknown error occurred</Heading>,
                        [Status.Done]: (
                            <Box>
                                <Progress value={countdown} mb={6}/>
                                <Center>
                                    <Heading size={"4xl"}>{code}</Heading>
                                </Center>
                            </Box>
                        )
                    }[status]}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default AttendanceCodeModal;