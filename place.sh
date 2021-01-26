#!/bin/bash

file1="i1_startup-config.cfg"
file2="i2_startup-config.cfg"
file3="i3_startup-config.cfg"
file4="i4_startup-config.cfg"

DIRECTORY="$1"

var1=$(find $DIRECTORY -name $file1 -print)
var2=$(find $DIRECTORY -name $file2 -print)
var3=$(find $DIRECTORY -name $file3 -print)
var4=$(find $DIRECTORY -name $file4 -print)

echo "$var1"
echo "$var2"
echo "$var3"
echo "$var4"

cp "./PE1_startup-config.cfg" $var1
cp "./R1_startup-config.cfg" $var2
cp "./R2_startup-config.cfg" $var3
cp "./PE2_startup-config.cfg" $var4

echo "###########################"
echo "Fichiers copiés  =)"
echo "###########################"