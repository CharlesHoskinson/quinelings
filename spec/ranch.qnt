// Finite phase/timer abstraction of ranch-world.js; see formal-quint-ranch.md.
module ranch {
  type Point = {x: int, y: int}
  type Resident = {source: int, intent: int, epoch: int, enabled: bool,
    energy: int, rest: bool, nursery: int, ready: int, pos: Point,
    invite: int, inviteExpiry: int, partner: int, pending: int}
  type Pair = {a: int, b: int, slotA: Point, slotB: Point, start: int,
    approach: int, attempt: int, arrived: bool, atSlots: bool, dwell: int}
  type Proposal = {a: int, b: int, sourceA: int, sourceB: int, intentA: int,
    intentB: int, epochA: int, epochB: int, created: int, expiry: int}
  type Receipt = {payload: int, revision: int}
  type Admission = {proposal: int, payload: int, child: int}
  type World = {tick: int, revision: int, nextSeq: int, nextProposal: int,
    residents: int -> Resident, pairs: int -> Pair, proposals: int -> Proposal,
    used: Set[int], consumed: Set[int], children: int -> int, receipts: int -> Receipt,
    admissions: int -> Admission, executions: int}
  var s: World
  var before: World
  var last: str
  var mutation: bool
  var wasCommand: bool
  var bornFrom: int
  pure val actors = Set(1,2,3,4)
  pure val ceiling = 60
  // One model energy boundary represents20 production ticks. Distinct social
  // phase actions permit pairing before the first boundary, as in production.
  pure val invitation = 6
  pure val approach = 8
  pure val attempt = 12
  pure val court = 4
  pure val proposalTTL = 30
  pure val cooldown = 10
  pure val nurseryTTL = 10
  pure val productionTimers = Map(("invitation",120),("approach",160),("attempt",240),
    ("court",80),("proposal",600),("cooldown",200),("nursery",200))
  pure def overlap(p: Point,q: Point): bool = p.x-q.x<48 and q.x-p.x<48 and p.y-q.y<48 and q.y-p.y<48
  pure def within160(p: Point,q: Point): bool = p.x-q.x<=160 and q.x-p.x<=160 and p.y-q.y<=160 and q.y-p.y<=160
  pure def inside(p: Point): bool = p.x>=24 and p.x<=488 and p.y>=24 and p.y<=296
  pure def clamp(n: int): int = if(n<0)0 else if(n>100)100 else n
  pure def adult(r: Resident): bool = r.nursery==0
  pure def eligible(w: World,id: int): bool = w.residents.keys().contains(id) and {
    val r=w.residents.get(id)
    r.enabled and adult(r) and not(r.rest) and r.energy>=60 and w.tick>=r.ready and r.partner==0 and r.pending==0
  }
  pure def fresh(w: World,p: Proposal): bool = w.residents.keys().contains(p.a) and w.residents.keys().contains(p.b) and {
    val a=w.residents.get(p.a)
    val b=w.residents.get(p.b)
    a.source==p.sourceA and b.source==p.sourceB and a.intent==p.intentA and b.intent==p.intentB and a.epoch==p.epochA and b.epoch==p.epochB
  }
  pure def birthParent(r: Resident): bool = r.enabled and adult(r) and not(r.rest) and r.energy>=50
  pure def free(w: World,p: Point,owners: Set[int]): bool = inside(p) and
    w.residents.keys().forall(id=>owners.contains(id) or not(overlap(p,w.residents.get(id).pos))) and
    w.pairs.keys().forall(id=>{
      val pair=w.pairs.get(id)
      (owners.contains(pair.a) or not(overlap(p,pair.slotA))) and
      (owners.contains(pair.b) or not(overlap(p,pair.slotB)))
    })
  pure def newResident(source: int,p: Point,energy: int,nursery: int): Resident = {
    source:source,intent:0,epoch:0,enabled:false,energy:energy,rest:false,nursery:nursery,
    ready:0,pos:p,invite:0,inviteExpiry:0,partner:0,pending:0
  }
  pure def clearProposal(w: World,pid: int): World = {
    val remaining=w.proposals.keys().filter(k=>k!=pid).mapBy(k=>w.proposals.get(k))
    w.with("proposals",remaining).with("residents",w.residents.keys().mapBy(id=>{
      val r=w.residents.get(id)
      if(r.pending==pid)r.with("pending",0) else r
    }))
  }
  pure def clearPair(w: World,pid: int): World = {
    val p=w.pairs.get(pid)
    w.with("pairs",w.pairs.keys().filter(k=>k!=pid).mapBy(k=>w.pairs.get(k)))
      .with("residents",w.residents.keys().mapBy(id=>{
        val r=w.residents.get(id)
        if(id==p.a or id==p.b)r.with("partner",0).with("invite",0).with("inviteExpiry",0)
          .with("ready",if(r.ready>w.tick+2)r.ready else if(w.tick+2>ceiling)ceiling else w.tick+2) else r
      }))
  }
  pure def cleanup(w: World,id: int): World = {
    val pairIds=w.pairs.keys().filter(k=>w.pairs.get(k).a==id or w.pairs.get(k).b==id)
    val proposalIds=w.proposals.keys().filter(k=>w.proposals.get(k).a==id or w.proposals.get(k).b==id)
    val noPairs=pairIds.fold(w,(acc,k)=>clearPair(acc,k))
    val clean=proposalIds.fold(noPairs,(acc,k)=>clearProposal(acc,k))
    clean.with("residents",clean.residents.keys().mapBy(k=>{
      val r=clean.residents.get(k)
      if(k==id or r.invite==id)r.with("invite",0).with("inviteExpiry",0) else r
    }))
  }
  pure def boundary(w: World): World = {
    val t=w.tick+1
    val energyWorld=w.with("tick",t).with("residents",w.residents.keys().mapBy(id=>{
      val r=w.residents.get(id)
      val mature=r.with("nursery",if(r.nursery>0 and t>=r.nursery)0 else r.nursery)
      val delta=if(mature.nursery>0 or mature.rest)4 else if(mature.partner!=0)-2 else if(t<mature.ready)2 else -1
      val e=clamp(mature.energy+delta)
      mature.with("energy",e).with("rest",if(e<20)true else if(e>=60)false else mature.rest)
    }))
    val rested=energyWorld.residents.keys().filter(id=>energyWorld.residents.get(id).rest)
      .fold(energyWorld,(acc,id)=>cleanup(acc,id))
    val expiredPairs=rested.pairs.keys().filter(k=>{
      val p=rested.pairs.get(k)
      t>=p.attempt or (not(p.arrived) and t>=p.approach)
    })
    val noPairs=expiredPairs.fold(rested,(acc,k)=>clearPair(acc,k))
    val expiredProposals=noPairs.proposals.keys().filter(k=>t>=noPairs.proposals.get(k).expiry)
    val noProposals=expiredProposals.fold(noPairs,(acc,k)=>clearProposal(acc,k))
    val invitations=noProposals.with("residents",noProposals.residents.keys().mapBy(id=>{
      val r=noProposals.residents.get(id)
      if(r.invite!=0 and t>=r.inviteExpiry)r.with("invite",0).with("inviteExpiry",0)
        .with("ready",if(r.ready>t+1)r.ready else if(t+1>ceiling)ceiling else t+1) else r
    }))
    invitations.pairs.keys().fold(invitations,(acc,k)=>{
      val p=acc.pairs.get(k)
      val dwell=if(p.atSlots)p.dwell+1 else 0
      if(dwell<court)acc.with("pairs",acc.pairs.set(k,p.with("dwell",dwell))) else {
        val a=acc.residents.get(p.a)
        val b=acc.residents.get(p.b)
        val proposal={a:p.a,b:p.b,sourceA:a.source,sourceB:b.source,intentA:a.intent,intentB:b.intent,
          epochA:a.epoch,epochB:b.epoch,created:t,expiry:t+proposalTTL}
        acc.with("pairs",acc.pairs.keys().filter(pid=>pid!=k).mapBy(pid=>acc.pairs.get(pid)))
          .with("proposals",acc.proposals.put(k,proposal))
          .with("residents",acc.residents.keys().mapBy(id=>{
            val r=acc.residents.get(id)
            if(id==p.a or id==p.b)r.with("partner",0).with("invite",0).with("inviteExpiry",0).with("pending",k).with("ready",t+cooldown) else r
          }))
      }
    })
  }
  pure def empty: World = {tick:0,revision:0,nextSeq:1,nextProposal:1,residents:Map(),pairs:Map(),proposals:Map(),
    used:Set(),consumed:Set(),children:Map(),receipts:Map(),admissions:Map(),executions:0}
  action init = all {s'=empty,before'=empty,last'="init",mutation'=false,wasCommand'=false,bornFrom'=0}
  action reject = all {s'=s,before'=s,last'="reject",mutation'=false,wasCommand'=false,bornFrom'=0}
  action command(draft: World,payload: int,seq: int,revision: int): bool = {
    val retained=s.receipts.keys().contains(seq)
    if(retained) all {s'=s,before'=s,last'=if(s.receipts.get(seq).payload==payload)"replay" else "reject",mutation'=false,wasCommand'=false,bornFrom'=0}
    else if(seq!=s.nextSeq or revision!=s.revision or s.revision>=ceiling or s.nextSeq>=ceiling or draft.tick>ceiling or
      draft.proposals.keys().exists(k=>draft.proposals.get(k).expiry>ceiling) or
      draft.residents.keys().exists(k=>draft.residents.get(k).nursery>ceiling or draft.residents.get(k).epoch>8)) reject
    else {
      val retainedReceipts=s.receipts.keys().filter(k=>k>=seq-1).mapBy(k=>s.receipts.get(k)).put(seq,{payload:payload,revision:s.revision+1})
      all {s'=draft.with("revision",s.revision+1).with("nextSeq",seq+1).with("receipts",retainedReceipts),
        before'=s,last'="command",mutation'=true,wasCommand'=true,bornFrom'=0}
    }
  }
  action apply(draft: World,payload: int): bool = command(draft,payload,s.nextSeq,s.revision)
  action importResident(id: int,p: Point): bool = if(actors.contains(id) and not(s.used.contains(id)) and free(s,p,Set()))
    apply(s.with("residents",s.residents.put(id,newResident(id,p,60,0))).with("used",s.used.union(Set(id))),1) else reject
  action participate(id: int,activeFlag: bool): bool = if(s.residents.keys().contains(id)) {
    val r=s.residents.get(id)
    val clean=if(activeFlag) s else cleanup(s,id)
    val draft=if(r.enabled==activeFlag)clean else clean.with("residents",clean.residents.set(id,clean.residents.get(id).with("enabled",activeFlag).with("epoch",r.epoch+1)))
    apply(draft,2)
  } else reject
  action invite(a: int,b: int): bool = if(a!=b and eligible(s,a) and eligible(s,b) and s.tick+invitation<=ceiling)
    apply(s.with("residents",s.residents.set(a,s.residents.get(a).with("invite",b).with("inviteExpiry",s.tick+invitation))),3) else reject
  // Split reciprocal phase; positions and arrival are abstracted separately.
  action reciprocate(a: int,b: int,slotA: Point,slotB: Point): bool = if(a<b and eligible(s,a) and eligible(s,b) and
    s.residents.get(a).invite==b and s.residents.get(b).invite==a and s.nextProposal<=8 and s.tick+attempt<=ceiling and
    within160(slotA,s.residents.get(a).pos) and within160(slotB,s.residents.get(b).pos) and not(overlap(slotA,slotB)) and free(s,slotA,Set(a,b)) and free(s,slotB,Set(a,b))) {
    val p={a:a,b:b,slotA:slotA,slotB:slotB,start:s.tick,approach:s.tick+approach,attempt:s.tick+attempt,arrived:false,atSlots:false,dwell:0}
    val rs=s.residents.set(a,s.residents.get(a).with("partner",b).with("invite",0).with("inviteExpiry",0))
      .set(b,s.residents.get(b).with("partner",a).with("invite",0).with("inviteExpiry",0))
    apply(s.with("pairs",s.pairs.put(s.nextProposal,p)).with("nextProposal",s.nextProposal+1).with("residents",rs),4)
  } else reject
  action arrive(pid: int): bool = if(s.pairs.keys().contains(pid)) {
    val p=s.pairs.get(pid)
    if(s.tick<p.approach and s.tick<p.attempt and free(s,p.slotA,Set(p.a,p.b)) and free(s,p.slotB,Set(p.a,p.b)))
      apply(s.with("pairs",s.pairs.set(pid,p.with("arrived",true).with("atSlots",true))).with("residents",
        s.residents.set(p.a,s.residents.get(p.a).with("pos",p.slotA)).set(p.b,s.residents.get(p.b).with("pos",p.slotB))),5)
    else reject
  } else reject
  action tick = apply(boundary(s),6)
  action advance2 = apply(boundary(boundary(s)),7)
  action withdraw(id: int): bool = participate(id,false)
  action annotate(id: int): bool = if(s.residents.keys().contains(id)) {
    val r=s.residents.get(id)
    val clean=cleanup(s,id)
    apply(clean.with("residents",clean.residents.set(id,clean.residents.get(id).with("intent",r.intent+1).with("epoch",r.epoch+1))),8)
  } else reject
  action retire(id: int): bool = if(s.residents.keys().contains(id)) {
    val clean=cleanup(s,id)
    apply(clean.with("residents",clean.residents.keys().filter(k=>k!=id).mapBy(k=>clean.residents.get(k))),9)
  } else reject
  action cancel(pid: int): bool = if(s.proposals.keys().contains(pid))apply(clearProposal(s,pid),9) else reject
  def canAdmit(pid: int,child: int,p: Point,revision: int,epochA: int,epochB: int): bool =
    s.proposals.keys().contains(pid) and not(s.consumed.contains(pid)) and actors.contains(child) and
    not(s.used.contains(child)) and free(s,p,Set()) and revision==s.revision and s.revision<ceiling and s.tick+nurseryTTL<=ceiling and {
      val pr=s.proposals.get(pid)
      s.tick<pr.expiry and fresh(s,pr) and pr.epochA==epochA and pr.epochB==epochB and
      birthParent(s.residents.get(pr.a)) and birthParent(s.residents.get(pr.b))
    }
  action admit(pid: int,child: int,p: Point,key: int,payload: int,revision: int,epochA: int,epochB: int): bool =
    if(s.admissions.keys().contains(key)) all {s'=s,before'=s,last'=if(s.admissions.get(key).payload==payload and s.admissions.get(key).proposal==pid and s.admissions.get(key).child==child)"replay" else "reject",mutation'=false,wasCommand'=false,bornFrom'=0}
    else if(canAdmit(pid,child,p,revision,epochA,epochB) and s.admissions.keys().size()<4 and Set(1,2,3,4).contains(key)) {
      val pr=s.proposals.get(pid)
      val clean=clearProposal(s,pid)
      val rs=clean.residents.set(pr.a,clean.residents.get(pr.a).with("energy",clean.residents.get(pr.a).energy-30).with("ready",s.tick+cooldown))
        .set(pr.b,clean.residents.get(pr.b).with("energy",clean.residents.get(pr.b).energy-30).with("ready",s.tick+cooldown))
        .put(child,newResident(3,p,40,s.tick+nurseryTTL))
      all {s'=clean.with("residents",rs).with("revision",s.revision+1).with("used",s.used.union(Set(child))).with("consumed",s.consumed.union(Set(pid)))
        .with("children",s.children.put(pid,child)).with("admissions",s.admissions.put(key,{proposal:pid,payload:payload,child:child})),
        before'=s,last'="birth",mutation'=true,wasCommand'=false,bornFrom'=pid}
    } else reject
  action admitFresh(pid: int,child: int,p: Point,key: int): bool = if(s.proposals.keys().contains(pid)) {
    val pr=s.proposals.get(pid)
    admit(pid,child,p,key,key,s.revision,pr.epochA,pr.epochB)
  } else admit(pid,child,p,key,key,s.revision,0,0)
  action step = {
    nondet a=actors.oneOf()
    nondet b=actors.oneOf()
    nondet pid=Set(1,2,3,4,5,6,7,8).oneOf()
    nondet key=Set(1,2,3,4).oneOf()
    nondet point=Set({x:24,y:24},{x:72,y:24},{x:24,y:72},{x:72,y:72},{x:216,y:96},{x:344,y:176},{x:392,y:176}).oneOf()
    nondet activeFlag=Set(true,false).oneOf()
    nondet seq=Set(s.nextSeq,s.nextSeq-1,s.nextSeq+1,1).oneOf()
    nondet payload=Set(1,2,3,4,5,6,7,8,9).oneOf()
    any {importResident(a,point),participate(a,activeFlag),invite(a,b),
      reciprocate(a,b,{x:120,y:96},{x:168,y:96}),
      reciprocate(a,b,{x:344,y:224},{x:392,y:224}),arrive(pid),leave(pid),tick,advance2,
      withdraw(a),retire(a),annotate(a),cancel(pid),admitFresh(pid,b,point,key),
      command(s,payload,seq,s.revision),reject}
  }
  val bounded = s.used.subseteq(actors) and s.residents.keys().subseteq(s.used) and s.residents.keys().filter(id=>s.residents.get(id).nursery>0).size()<=2 and s.residents.keys().subseteq(actors) and s.residents.keys().size()<=4 and s.pairs.keys().size()<=2 and s.proposals.keys().size()<=2 and
    s.residents.keys().forall(id=>{val r=s.residents.get(id) r.energy>=0 and r.energy<=100 and r.epoch>=0 and r.epoch<=8}) and
    s.tick>=0 and s.tick<=ceiling and s.revision>=0 and s.revision<=ceiling and s.nextSeq>=1 and s.nextSeq<=ceiling
  val geometry = s.residents.keys().forall(a=>inside(s.residents.get(a).pos) and s.residents.keys().forall(b=>a==b or not(overlap(s.residents.get(a).pos,s.residents.get(b).pos))))
  val pairBijection = s.pairs.keys().forall(k=>{
    val p=s.pairs.get(k)
    s.residents.keys().contains(p.a) and s.residents.keys().contains(p.b) and p.a!=p.b and
    s.residents.get(p.a).partner==p.b and s.residents.get(p.b).partner==p.a and
    s.residents.get(p.a).pending==0 and s.residents.get(p.b).pending==0 and
    s.residents.get(p.a).invite==0 and s.residents.get(p.b).invite==0 and
    p.approach==p.start+approach and p.attempt==p.start+attempt and s.tick<p.attempt and (p.arrived or s.tick<p.approach) and
    not(overlap(p.slotA,p.slotB)) and free(s,p.slotA,Set(p.a,p.b)) and free(s,p.slotB,Set(p.a,p.b)) and
    s.pairs.keys().forall(j=>j==k or {val other=s.pairs.get(j) p.a!=other.a and p.a!=other.b and p.b!=other.a and p.b!=other.b})
  }) and s.residents.keys().forall(id=>s.residents.get(id).partner==0 or s.pairs.keys().exists(k=>{
    val p=s.pairs.get(k) (p.a==id and p.b==s.residents.get(id).partner) or (p.b==id and p.a==s.residents.get(id).partner)
  }))
  val proposalBijection = s.proposals.keys().forall(k=>{
    val p=s.proposals.get(k)
    fresh(s,p) and p.a!=p.b and s.tick<p.expiry and p.expiry==p.created+proposalTTL and p.expiry<=ceiling and
    s.residents.get(p.a).pending==k and s.residents.get(p.b).pending==k and
    s.residents.get(p.a).partner==0 and s.residents.get(p.b).partner==0 and
    not(s.consumed.contains(k))
  }) and s.residents.keys().forall(id=>s.residents.get(id).pending==0 or s.proposals.keys().exists(k=>{
    val p=s.proposals.get(k) s.residents.get(id).pending==k and (p.a==id or p.b==id)
  }))
  val mutualCreation = s.pairs.keys().filter(k=>not(before.pairs.keys().contains(k))).forall(k=>{
    val p=s.pairs.get(k)
    before.residents.keys().contains(p.a) and before.residents.keys().contains(p.b) and
    before.residents.get(p.a).invite==p.b and before.residents.get(p.b).invite==p.a
  })
  val rejectedUnchanged = not(Set("reject","replay").contains(last)) or s==before
  val revisionRule = s.revision==before.revision+(if(mutation)1 else 0)
  val sequenceRule = s.nextSeq==before.nextSeq+(if(wasCommand)1 else 0) and s.receipts.keys().size()<=2 and
    s.receipts.keys().forall(k=>k<s.nextSeq and k>=s.nextSeq-2 and s.receipts.get(k).revision<=s.revision)
  val singleChild = s.children.keys()==s.consumed and s.admissions.keys().forall(k=>{
    val a=s.admissions.get(k) s.consumed.contains(a.proposal) and s.children.get(a.proposal)==a.child
  }) and s.admissions.keys().forall(a=>s.admissions.keys().forall(b=>a==b or s.admissions.get(a).proposal!=s.admissions.get(b).proposal))
  val atomicBirth = last!="birth" or {
    val p=before.proposals.get(bornFrom)
    s.residents.get(p.a).energy==before.residents.get(p.a).energy-30 and
    s.residents.get(p.b).energy==before.residents.get(p.b).energy-30 and
    s.residents.keys().size()==before.residents.keys().size()+1 and not(s.proposals.keys().contains(bornFrom)) and
    s.consumed==before.consumed.union(Set(bornFrom)) and s.revision==before.revision+1 and {
      val child=s.residents.get(s.children.get(bornFrom))
      child.energy==40 and not(child.enabled) and child.nursery==s.tick+nurseryTTL and child.partner==0 and child.pending==0
    }
  }
  val passive = s.executions==before.executions and s.executions==0
  val safety = bounded and geometry and mutualCreation and pairBijection and proposalBijection and rejectedUnchanged and revisionRule and sequenceRule and singleChild and atomicBirth and passive

  action leave(pid: int): bool = if(s.pairs.keys().contains(pid)) {
    val p=s.pairs.get(pid)
    val a=p.slotA.with("y",p.slotA.y-48)
    val b=p.slotB.with("y",p.slotB.y-48)
    if(free(s,a,Set(p.a,p.b)) and free(s,b,Set(p.a,p.b)))apply(s.with("pairs",s.pairs.set(pid,p.with("atSlots",false).with("dwell",0)))
      .with("residents",s.residents.set(p.a,s.residents.get(p.a).with("pos",a)).set(p.b,s.residents.get(p.b).with("pos",b))),5) else reject
  } else reject
  action parents = init.then(importResident(1,{x:24,y:24})).then(importResident(2,{x:72,y:24}))
    .then(participate(1,true)).then(participate(2,true))
  action paired = parents.then(invite(1,2)).then(invite(2,1))
    .then(reciprocate(1,2,{x:120,y:96},{x:168,y:96}))
  action nearbyProposal = paired.then(arrive(1)).then(tick).then(tick).then(tick).then(tick)
  // Unsafe controls are excluded from step. Each is checked by a named test.
  action unsafe(draft: World,label: str): bool = all {
    s'=draft.with("revision",s.revision+1),before'=s,last'=label,mutation'=true,wasCommand'=false,bornFrom'=0
  }
  action unsafeUnilateralPair = {
    val p={a:1,b:2,slotA:{x:120,y:96},slotB:{x:168,y:96},start:s.tick,
      approach:s.tick+approach,attempt:s.tick+attempt,arrived:false,atSlots:false,dwell:0}
    unsafe(s.with("pairs",s.pairs.put(1,p)).with("residents",s.residents.set(1,s.residents.get(1).with("partner",2).with("invite",0)).set(2,s.residents.get(2).with("partner",1))),"unsafe")
  }
  action unsafeOneSidedCleanup = unsafe(s.with("pairs",Map()).with("residents",s.residents.set(1,s.residents.get(1).with("partner",0))),"unsafe")
  action unsafePartialCharge = {
    val pr=s.proposals.get(1)
    val clean=clearProposal(s,1)
    val rs=clean.residents.set(pr.a,clean.residents.get(pr.a).with("energy",clean.residents.get(pr.a).energy-30))
      .put(3,newResident(3,{x:24,y:72},40,s.tick+nurseryTTL))
    all {s'=clean.with("residents",rs).with("revision",s.revision+1).with("consumed",s.consumed.union(Set(1)))
      .with("children",s.children.put(1,3)).with("admissions",s.admissions.put(1,{proposal:1,payload:1,child:3})),
      before'=s,last'="birth",mutation'=true,wasCommand'=false,bornFrom'=1}
  }
  action unsafeStaleProposal = unsafe(s.with("residents",s.residents.set(1,s.residents.get(1).with("epoch",s.residents.get(1).epoch+1))),"unsafe")
  action unsafeNewKeyReplay = unsafe(s.with("residents",s.residents.put(4,newResident(4,{x:72,y:72},40,s.tick+nurseryTTL)))
    .with("children",s.children.put(1,4)).with("admissions",s.admissions.put(2,{proposal:1,payload:2,child:4})),"unsafe")
  action unsafeOccupiedSpawn = unsafe(s.with("residents",s.residents.put(3,newResident(3,s.residents.get(1).pos,60,0))),"unsafe")
  action unsafeForgottenRevision = all {s'=s.with("residents",s.residents.put(3,newResident(3,{x:24,y:72},60,0))),
    before'=s,last'="unsafe",mutation'=true,wasCommand'=false,bornFrom'=0}
  action unsafePartialAdvance = all {s'=s.with("tick",s.tick+1),before'=s,last'="reject",mutation'=false,wasCommand'=false,bornFrom'=0}
  action unsafeImplicitRun = unsafe(s.with("executions",s.executions+1),"unsafe")
  run useful_nearby_birthTest = nearbyProposal.then(admitFresh(1,3,{x:24,y:72},1))
    .expect(safety and s.residents.get(1).energy==22 and s.residents.get(2).energy==22 and s.residents.get(3).energy==40 and s.executions==0)
  run occupied_spawn_rejectionTest = parents.then(importResident(3,{x:24,y:24})).expect(safety and rejectedUnchanged and s.residents.keys().size()==2)
  run stale_birth_epoch_rejectionTest = nearbyProposal.then(admit(1,3,{x:24,y:72},1,1,s.revision,0,0)).expect(safety and rejectedUnchanged and s.consumed.size()==0)
  run annotation_cancels_bothTest = nearbyProposal.then(annotate(1)).expect(safety and s.proposals.keys().size()==0 and s.residents.get(2).pending==0)
  run withdrawal_cancels_pairTest = paired.then(withdraw(1)).expect(safety and s.pairs.keys().size()==0 and s.residents.get(2).partner==0)
  run retained_command_replayTest = parents.then(command(s,2,s.nextSeq-1,0)).expect(safety and last=="replay" and s==before)
  run conflicting_command_replayTest = parents.then(command(s,9,s.nextSeq-1,0)).expect(safety and last=="reject" and s==before)
  run gap_command_rejectionTest = parents.then(command(s,2,s.nextSeq+1,s.revision)).expect(safety and last=="reject")
  run discarded_command_rejectionTest = parents.then(command(s,1,1,0)).expect(safety and last=="reject")
  run retained_birth_replayTest = nearbyProposal.then(admitFresh(1,3,{x:24,y:72},1)).then(admitFresh(1,3,{x:24,y:72},1)).expect(safety and last=="replay" and s==before)
  run conflicting_birth_key_rejectionTest = nearbyProposal.then(admitFresh(1,3,{x:24,y:72},1)).then(admitFresh(1,4,{x:72,y:72},1)).expect(safety and last=="reject" and s==before)
  run consumed_proposal_new_key_rejectedTest = nearbyProposal.then(admitFresh(1,3,{x:24,y:72},1)).then(admitFresh(1,4,{x:72,y:72},2)).expect(safety and last=="reject" and s.residents.keys().size()==3)
  run retirement_cancels_proposalTest = nearbyProposal.then(retire(1)).expect(safety and s.proposals.keys().size()==0 and s.residents.get(2).pending==0).then(importResident(1,{x:24,y:24})).expect(safety and last=="reject")
  run detects_unilateral_pairTest = parents.then(invite(1,2)).then(unsafeUnilateralPair).expect(not(mutualCreation))
  run detects_one_sided_cleanupTest = paired.then(unsafeOneSidedCleanup).expect(not(pairBijection))
  run detects_partial_chargeTest = nearbyProposal.then(unsafePartialCharge).expect(not(atomicBirth))
  run detects_stale_proposalTest = nearbyProposal.then(unsafeStaleProposal).expect(not(proposalBijection))
  run detects_new_key_replayTest = nearbyProposal.then(admitFresh(1,3,{x:24,y:72},1)).then(unsafeNewKeyReplay).expect(not(singleChild))
  run detects_occupied_spawnTest = parents.then(unsafeOccupiedSpawn).expect(not(geometry))
  run detects_forgotten_revisionTest = parents.then(unsafeForgottenRevision).expect(not(revisionRule))
  run detects_partial_advanceTest = parents.then(unsafePartialAdvance).expect(not(rejectedUnchanged))
  run detects_implicit_runTest = parents.then(unsafeImplicitRun).expect(not(passive))
  run delayed_recovery_birthTest = paired.then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(arrive(1)).then(tick).then(tick).then(tick).then(tick).expect(safety and s.residents.get(1).energy==38 and s.proposals.keys().contains(1))
    .then(admitFresh(1,3,{x:24,y:72},1)).expect(safety and last=="reject").then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(admitFresh(1,3,{x:24,y:72},1)).expect(safety and s.residents.get(1).energy==20 and s.consumed.contains(1))
  run approach_half_open_expiryTest = paired.then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).expect(safety and s.pairs.keys().contains(1)).then(tick).expect(safety and s.pairs.keys().size()==0 and s.residents.get(1).partner==0)
  run proposal_half_open_expiryTest = nearbyProposal.then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).expect(safety and s.proposals.keys().contains(1)).then(tick).expect(safety and s.proposals.keys().size()==0 and s.residents.get(2).pending==0)
  run immutable_attempt_deadlineTest = paired.then(arrive(1)).then(tick).then(leave(1)).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).then(tick).expect(safety and s.pairs.keys().contains(1) and s.pairs.get(1).attempt==12).then(tick).expect(safety and s.pairs.keys().size()==0)

  action initAtTick(t: int): bool = {
    val state=empty.with("tick",t)
    all {s'=state,before'=state,last'="init",mutation'=false,wasCommand'=false,bornFrom'=0}
  }
  // Test fixture only: install a valid bounded energy/rest state.
  action energyFixture(id: int,e: int,restFlag: bool): bool = unsafe(s.with("residents",s.residents.set(id,s.residents.get(id).with("energy",e).with("rest",restFlag))),"fixture")
  run batch_advances_one_revisionTest = init.then(advance2).expect(safety and s.tick==2 and s.revision==1 and s.nextSeq==2)
  run batch_ceiling_rejects_entire_draftTest = initAtTick(59).then(advance2).expect(safety and last=="reject" and s==before and s.tick==59 and s.revision==0)
  run frozen_tick_safe_importTest = initAtTick(60).then(importResident(1,{x:24,y:24})).expect(safety and s.tick==60 and s.revision==1)
  run below20_cancels_both_pair_sidesTest = paired.then(energyFixture(1,21,false)).then(tick)
    .expect(safety and s.residents.get(1).energy==19 and s.residents.get(1).rest and s.pairs.keys().size()==0 and s.residents.get(2).partner==0)
  run rest_recovery_has_energy_priorityTest = parents.then(energyFixture(1,19,true)).then(tick)
    .expect(safety and s.residents.get(1).energy==23 and s.residents.get(1).rest)

  // A focused executable relation increases pair/proposal/birth coverage; it
  // contains only safe actions and starts from the paired fixture.
  action familyStep = {
    nondet key=Set(1,2,3,4).oneOf()
    any {arrive(1),leave(1),tick,advance2,admitFresh(1,3,{x:24,y:72},key),
      admitFresh(1,4,{x:72,y:72},key),withdraw(1),annotate(1),retire(1),cancel(1),reject}
  }
}
