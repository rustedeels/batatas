my-prefix
# chapter1|char1,char2(#playerLikesWoman())
! #hasCar()
& backRoom1
& music3
$ actionNoParam[]()
$ actionParam[100]()
$ actionConditional[{ name: #partyName(1) }](#hasParty(1))
T 3000
> go to chapter 2[chapter2]()
> go to chapter 3[chapter3](#hasParty(1))

## dialog1|1
& `#getCharPose(0)`
& `#getCharPose(1)`(#hasChar(1))

* Hey I have money
& videoMoney[LOOP]()
! #hasMoney()

* Hey I have a ring
& imgRing
! #hasRing()

## dialog2|0
& imgFemale[](#isFemale())
& imgMale(#isMale())

* Hey my name is `#charName()`
* And I have `#charAge()` years
$ diaglogAction

## dialog3|1
! #hasParty(1)

* Let's go

# chapter2|char1,char2
! `#hasCar()`
& backRoom2
& music3
$ actionNoParam[]()
> go to chapter 2[chapter1]()

## dialog3|1
! #hasParty(1)
