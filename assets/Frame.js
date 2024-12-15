import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text, Image, Alert, TouchableOpacity } from "react-native";
import { Color, Border, FontSize, Profile_Border, Profile_FontSize } from "./GlobalStyles";

const Frame = ({ startRegion, endRegion, startTime, carNumber }) => {
    const getAdjustedPosition = (text) => {
        // 텍스트 길이에 따라 동적으로 위치 조정
        const maxCharacters = 3; // 기준 길이 (2글자)
        const offset = 4; // 한 글자당 이동 거리 (픽셀 기준)
        const extraCharacters = Math.max(0, text.length - maxCharacters);
        return (extraCharacters * offset) / 3; // 추가 글자 수에 따라 위치 이동
    };
    const startOffset = getAdjustedPosition(startRegion);
    return (
        <View style={[styles.rectangleParent, styles.frameChildLayout]}>
            <View style={[styles.frameChild, styles.framePosition]} />
            <View style={[styles.frameItem, styles.framePosition]} />
            <Text
                style={[
                    styles.text,
                ]}
            >
                {startRegion}
            </Text>
            <Text style={[styles.text1, styles.textFlexBox]}>{endRegion}</Text>
            <Image style={styles.frameInner} resizeMode="cover" source={require("../assets/Arrow1.png")} />
            <Text style={[styles.text2, styles.textFlexBox]}>{startTime}</Text>
            <Image style={styles.groupIcon} resizeMode="cover" source={require("../assets/Group.png")} />
            <Text style={[styles.text3, styles.textFlexBox]}>
                <Text style={styles.text4}>{`차량 번호\n`}</Text>
                <Text style={styles.text5}>{carNumber}</Text>
            </Text>
            <View style={styles.ellipseWrapper}>
                <Image
                    style={styles.ellipseIcon}
                    resizeMode="contain"
                    source={require("../assets/Ellipse.png")}
                />
            </View>
        </View>);
};

const Notice = () => {
    const messages = [
        `운전 면허 인증을 해야 카풀 모집을 \n할 수 있습니다`,
        "출발 전에 반드시 동승자와 연락하세요.",
        "안전한 운행을 위해 휴식을 취하세요.",
    ];
    const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 5000); // 5초마다 변경

        return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
    }, []);
    return (
        <View style={[Noticestyles.rectangleParent, Noticestyles.frameChildLayout]}>
            <View style={[Noticestyles.frameChild, Noticestyles.frameChildLayout]} />
            <Image style={Noticestyles.vectorIcon} resizeMode="cover" source={require("../assets/vector.png")} />
            <Text style={Noticestyles.text}>
                <Text style={Noticestyles.txt}>
                    {messages[currentMessageIndex]}
                </Text>
            </Text>
        </View>
    );
};

const Profile = ({ username, permission, onVerify }) => {
    return (
        <View style={[Profilestyles.rectangleParent, Profilestyles.frameChildLayout]}>
            <View style={[Profilestyles.frameChild, Profilestyles.frameBorder]} />
            <Text style={Profilestyles.text}>{`${username} 님,\n환영합니다!`}</Text>
            <Text style={Profilestyles.text1}>
                <Text style={Profilestyles.text5}>
                    {permission === "운전자" ? (
                        <Text style={Profilestyles.text7}>운전자입니다.</Text>
                    ) : (
                        <TouchableOpacity onPress={onVerify}>
                            <Text style={Profilestyles.verificationButton}>운전 면허 인증하기</Text>
                        </TouchableOpacity>
                    )}
                </Text>
            </Text>
            <Image style={[Profilestyles.frameItem, Profilestyles.text9Position]} resizeMode="cover" source={require("../assets/ellipse-5.png")} />
            <Image style={Profilestyles.icon} resizeMode="cover" source={require("../assets/unnamed.png")} />
            <View style={[Profilestyles.frameInner, Profilestyles.frameBorder]} />
            <Text style={[Profilestyles.text9, Profilestyles.text9Position]}>운전 레벨</Text>
            <Image style={Profilestyles.ellipseIcon} resizeMode="cover" source={require("../assets/ellipse-6.png")} />
            <Text style={Profilestyles.text10}>?</Text>
            <View style={[Profilestyles.rectangleView, Profilestyles.frameChild1Position]} />
            <View style={[Profilestyles.frameChild1, Profilestyles.frameChild1Position]} />
            <Text style={[Profilestyles.lv1, Profilestyles.lv1Typo]}>Lv. 1</Text>
            <Text style={[Profilestyles.lv2, Profilestyles.lv1Typo]}>Lv. 2</Text>
        </View>);
};

const styles = StyleSheet.create({
    frameChildLayout: {
        height: 100,
        backgroundColor: Color.colorWhite,
        borderRadius: Border.br_base,
    },
    framePosition: {
        width: "100%", // 부모 너비에 맞게 설정
        position: "absolute",
    },
    textFlexBox: {
        textAlign: "center",
        position: "absolute"
    },
    frameChild: {
        borderRadius: Border.br_base,
        borderStyle: "solid",
        borderColor: Color.colorBlack,
        borderWidth: 2,
        height: 100,
        width: "100%",
        backgroundColor: Color.colorWhite
    },
    frameItem: {
        borderTopLeftRadius: Border.br_base,
        borderTopRightRadius: Border.br_base,
        backgroundColor: Color.colorBlack,
        height: 15
    },
    text: {
        left: "6%", // 화면 중앙에 가까운 위치로 정렬
        color: Color.colorBlack,
        fontWeight: "700",
        fontSize: FontSize.size_base,
        top: 30,
        alignContent: "center",
    },
    text1: {
        left: "47%",
        color: Color.colorBlack,
        fontWeight: "700",
        fontSize: FontSize.size_base,
        top: 30,
        textAlign: "center"
    },
    frameInner: {
        top: 40,
        left: 113,
        maxHeight: "100%",
        width: 52,
        position: "absolute"

    },
    text2: {
        top: 60,
        left: 87,
        fontSize: 10,
        fontWeight: "500",
        color: Color.colorBlack
    },
    groupIcon: {
        top: 16,
        left: "72%",
        width: 6,
        height: 80,
        position: "absolute"
    },
    text4: {
        color: "#6c6c6c",
        fontSize: 11,
    },
    text5: {
        color: Color.colorBlack,
        fontSize: 12.5,
    },
    text3: {
        top: 38,
        left: 297,
        // fontSize: 11,
    },
    // Ellipse 부모 컨테이너: 반만 보이도록 설정
    ellipseWrapper: {
        position: "absolute",
        top: 40,
        left: 0, // 위치 조정
        width: 15, // 오른쪽 절반이 제대로 보이도록 너비 설정
        height: 25, // 원래 이미지 높이를 유지
        overflow: "hidden", // 초과된 부분 숨기기
    },
    ellipseIcon: {
        width: 20,
        height: 20,
        position: "absolute",
        right: 0, // 이미지를 오른쪽으로 정렬
    },
    rectangleParent: {
        flex: 1,
        width: "100%",
        overflow: "hidden",
        height: 120, // 부모 높이 증가
    }
});


const Noticestyles = StyleSheet.create({
    frameChildLayout: {
        height: 74,
        borderRadius: Border.br_base,
    },
    frameChild: {
        top: 0,
        backgroundColor: "#3FB6E5",
        height: "100%",
        width: "100%",
        position: "absolute",
    },
    vectorIcon: {
        width: 29,
        height: 41,
        left: 20,
        top: 16,
        position: "absolute",
        overflow: "hidden"
    },
    text1: {
        fontSize: 14
    },
    txt: {
        width: "100%",

    },
    text: {
        top: 16,
        left: 78,
        fontWeight: "700",
        color: "#fff",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        width: 231,
        height: 47,
        position: "absolute"
    },
    rectangleParent: {
        backgroundColor: "rgba(255, 255, 255, 0)",
        flex: 0,
        overflow: "hidden",
        width: "100%",
    }
});

const Profilestyles = StyleSheet.create({
    frameChildLayout: {
        height: 180,
        borderRadius: Profile_Border.br_base
    },
    frameBorder: {
        borderStyle: "solid",
        position: "absolute"
    },
    text9Position: {
        left: 17,
        position: "absolute"
    },
    text8Position: {
        opacity: 0.6,
        position: "absolute"
    },
    frameChild1Position: {
        height: 12,
        borderRadius: Profile_Border.br_5xs,
        left: 121,
        top: 92,
        position: "absolute"
    },
    lv1Typo: {
        letterSpacing: -0.4,
        fontSize: Profile_FontSize.size_4xs,
        top: 90,
        color: Color.colorWhite,
        textAlign: "center",
        fontWeight: "700",
        position: "absolute"
    },
    frameChild: {
        top: 0,
        left: 0,
        backgroundColor: "#f1f2f3",
        borderColor: "#e8e9eb",
        borderWidth: 1,
        width: "100%",
        height: 180,
        borderRadius: Profile_Border.br_base
    },
    text: {
        top: 24,
        left: 74,
        fontSize: 16,
        width: 158,
        textAlign: "left",
        color: Color.colorBlack,
        fontWeight: "700",
        position: "absolute"
    },
    text3: {
        color: "#787878"
    },
    text4: {
        color: Color.colorBlack
    },
    text7: {
        color: "#4865C0"
    },
    text5: {
        fontWeight: "700"
    },
    text1: {
        top: 145,
        //   left: 145,
        textAlign: "center",
        fontSize: Profile_FontSize.size_smi,
        position: "absolute",
    },
    verificationButton: {
        fontSize: 16,
        color: "#007BFF", // 버튼 텍스트 색상
        fontWeight: "bold",
        textDecorationLine: "underline",
        textAlign: "center", // 가운데 정렬
    },
    frameItem: {
        top: 23,
        width: 40,
        height: 40
    },
    icon: {
        top: 35,
        left: 26,
        width: 23,
        height: 28,
        position: "absolute"
    },
    frameInner: {
        top: 130,
        left: 16,
        right: 16,
        borderColor: "#d6d6d6",
        borderTopWidth: 1,
        height: 1
    },
    text8: {
        top: 26,
        left: 247,
        fontSize: 11,
        textAlign: "right",
        color: Color.colorBlack
    },
    freeIconEditFile53721902: {
        top: 27,
        left: 315,
        width: 13,
        height: 13
    },
    text9: {
        top: 88,
        fontSize: Profile_FontSize.size_smi,
        left: 17,
        textAlign: "left",
        color: Color.colorBlack,
        fontWeight: "700"
    },
    ellipseIcon: {
        top: 93,
        left: 80,
        width: 10,
        height: 10,
        position: "absolute"
    },
    text10: {
        top: 92,
        left: 83,
        fontSize: 7,
        color: Color.colorWhite,
        textAlign: "center",
        fontWeight: "700",
        position: "absolute"
    },
    rectangleView: {
        backgroundColor: "#d9d9d9",
        width: 207
    },
    frameChild1: {
        backgroundColor: "#90CAF9",
        width: 74
    },
    lv1: {
        left: 127
    },
    lv2: {
        left: 304
    },
    rectangleParent: {
        backgroundColor: Color.colorWhite,
        flex: 1,
        width: "100%",
        overflow: "hidden",
        position: "relative", // 자식 요소의 absolute 배치를 허용
        alignItems: 'center',
    }
});

export { Frame, Notice, Profile };
