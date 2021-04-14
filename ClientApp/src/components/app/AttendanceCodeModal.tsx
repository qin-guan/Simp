import * as React from "react";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    Spacer,
    Progress,
    Heading,
    Center
} from "@chakra-ui/react";

import LessonInstance from "../../models/Lesson";
import { useEffect, useState } from "react";

import { getAttendanceCode } from "../../api/http/Lesson";

import ClassroomInstance from "../../models/Classroom";
import Status from "../../models/Status";

interface AttendanceCodeModalProps {
    isOpen: boolean
    onClose: () => void
    classroom: ClassroomInstance
    lesson: LessonInstance
}

const AttendanceCodeModal = (props: AttendanceCodeModalProps): React.ReactElement => {
    const { isOpen, onClose, classroom, lesson } = props;

    const [status, setStatus] = useState(Status.Loading);

    const [countdown, setCountdown] = useState(100);
    const [code, setCode] = useState<number>();

    
    useEffect(() => {
        const fetchAttendeeCode = async () => {
            try {
                const res = await getAttendanceCode(classroom.Id, lesson.Id);
                if (res !== code) {
                    setCountdown(100);
                }
                setCode(res);
            } catch {
                setStatus(Status.Error);
            }
        };

        const timer = setInterval(fetchAttendeeCode, 1000);
        fetchAttendeeCode();
        
        return () => {
            clearInterval(timer);
        };
    }, [code, classroom.Id, lesson.Id]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (countdown <= 0) setCountdown(100);
            else setCountdown(c => c - 100/30);
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
                    <Progress value={countdown} mb={6}/>
                    <Center>
                        <Heading size={"4xl"}>{code}</Heading>
                    </Center>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default AttendanceCodeModal;