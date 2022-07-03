import cv2
import numpy as np

img = cv2.imread('Imagem/lapis1.jpg')
cv2.imshow('Img', img)

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
kernel = np.ones((5,5), np.uint8)
erosion = cv2.erode(gray, kernel, iterations= 2)
dilation = cv2.dilate(erosion, kernel, iterations= 3)
gauss = cv2.GaussianBlur (dilation, (5,5), 0)
Canny = cv2.Canny(gauss, 70, 200)

ctns,   _ = cv2. findContours(Canny, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

objects = str(len(ctns))
print(objects)

cv2. imshow('Gray', gray)
cv2. imshow('erosion',erosion)
cv2. imshow('Canny',Canny)
cv2.waitKey(0)