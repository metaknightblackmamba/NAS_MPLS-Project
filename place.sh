#!/bin/bash
if [ $# -eq 0 ]; then
 echo "enter the path to your GNS3 MPLS project"
 exit 1
fi

file1="i1_startup-config.cfg"
file2="i2_startup-config.cfg"
file3="i3_startup-config.cfg"
file4="i4_startup-config.cfg"
file5="i5_startup-config.cfg"
file6="i6_startup-config.cfg"
file7="i7_startup-config.cfg"
file8="i8_startup-config.cfg"
file9="i9_startup-config.cfg"
file10="i10_startup-config.cfg"
file11="i11_startup-config.cfg"
file12="i12_startup-config.cfg"

file20="interfaces"

DIRECTORY="$1"

var1=$(find $DIRECTORY -name $file1 -print)
var2=$(find $DIRECTORY -name $file2 -print)
var3=$(find $DIRECTORY -name $file3 -print)
var4=$(find $DIRECTORY -name $file4 -print)
var5=$(find $DIRECTORY -name $file5 -print)
var6=$(find $DIRECTORY -name $file6 -print)
var7=$(find $DIRECTORY -name $file7 -print)
var8=$(find $DIRECTORY -name $file8 -print)
var9=$(find $DIRECTORY -name $file9 -print)
var10=$(find $DIRECTORY -name $file10 -print)
var11=$(find $DIRECTORY -name $file11 -print)
var12=$(find $DIRECTORY -name $file12 -print)


var20=$(find $DIRECTORY -name $file20 -print)

my_array=($(echo $var20 | tr " " "\n"))
j=1
for i in "${my_array[@]}"
do  
    cp "./PC"$j"_interfaces" $i
    echo "copy from ./PC"$j"_interfaces to $i"
    j=$(($j+1))
done

cp "./PE1_startup-config.cfg" $var1
echo "copy from ./PE1_startup-config.cfg to $var1"
cp "./R1_startup-config.cfg" $var2
echo "copy from ./R1_startup-config.cfg to $var2"
cp "./R2_startup-config.cfg" $var3
echo "copy from ./R2_startup-config.cfg to $var3"
cp "./PE2_startup-config.cfg" $var4
echo "copy from ./PE2_startup-config.cfg to $var4"
cp "./TC_CE1_startup-config.cfg" $var5
echo "copy from ./TC_CE1_startup-config.cfg to $var5"
cp "./IT_CE1_startup-config.cfg" $var6
echo "copy from ./IT_CE1_startup-config.cfg to $var6"
cp "./TC_CE2_startup-config.cfg" $var7
echo "copy from ./TC_CE2_startup-config.cfg to $var7"
cp "./IT_CE2_startup-config.cfg" $var8
echo "copy from ./IT_CE2_startup-config.cfg to $var8"
cp "./R3_startup-config.cfg" $var9
echo "copy from ./R3_startup-config.cfg to $var9"
cp "./R4_startup-config.cfg" $var10
echo "copy from ./R4_startup-config.cfg to $var10"
cp "./PE3_startup-config.cfg" $var11
echo "copy from ./PE3_startup-config.cfg to $var11"
cp "./CE_Commun_startup-config.cfg" $var12
echo "copy from ./CE_Commun_startup-config.cfg to $var12"

echo "###########################"
echo "Fichiers copiés  =)"
echo "###########################"
exit 0