def Lc(L):
	R=True;P='v';K='d';Q=16;G=[];D=0;F=0;N=Q;O=0;H={};I=R;A=0;C=2;B=4
	def J(v,A):
		nonlocal D,F,G;B=0;A=A>>1
		while A!=0:
			D=v>>B&1|D<<1;F+=1
			if F==N:F=0;G.append(chr(D));D=0
			A=A>>1;B+=1
	def M():
		nonlocal I,C,B
		if I:I=False
		else:J(E[P],B)
		if not A in H:
			C+=1
			if C>=B:B<<=1
			if A<256:D=0;F=256
			else:D=1;F=65536
			J(D,B);J(A,F);H[A]={P:C,K:{}};I=R
		C+=1
		if C>=B:B<<=1
	A=ord(L[0]);M();B=4;C-=1;E=H[A]
	for O in range(1,len(L)):
		A=ord(L[O])
		if A in E[K]:E=E[K][A]
		else:M();E[K][A]={P:C,K:{}};E=H[A]
	M();J(2,B);D<<=N-F;G.append(chr(D));return ''.join(G)
def Ld(G):
	Q=len(G);N=16;H='';D=[H,H,H];B=4;I=4;E=3;O=[];A=0;J=2;P=ord(G[0]);F=N;K=0
	def L():
		nonlocal P,F,N,G,K,A,I;A=B=0
		while B!=J:
			F-=1;A+=(P>>F&1)<<B;B+=1
			if F==0:F=N;K+=1;P=ord(G[K])
	L();J=A*8+8;L();C=chr(A);D.append(C);O.append(C)
	while K<=Q:
		J=E;L()
		if A<2:
			J=8+8*A;L();D.append(chr(A));A=I;I+=1;B-=1
			if B==0:B=1<<E;E+=1
		elif A==2:return H.join(O)
		if A<len(D):M=D[A]
		else:M=C+C[0]
		O.append(M);D.append(C+M[0]);I+=1;C=M;B-=1
		if B==0:B=1<<E;E+=1

#print (Ld(Lc("hi there hi there hi there hi there")))
